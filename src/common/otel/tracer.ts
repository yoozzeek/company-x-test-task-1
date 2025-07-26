import {
  NodeTracerProvider,
  ReadableSpan,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import process from 'process';
import { ExportResultCode } from '@opentelemetry/core';

class DevExporter implements SpanExporter {
  constructor(private exporter: SpanExporter) {}

  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    console.log(`[otel] exporting ${spans.length} span(s)...`);
    this.exporter.export(spans, (result) => {
      if (result.code !== ExportResultCode.SUCCESS) {
        console.error('[otel] export failed:', result.error ?? 'unknown error');
      }
      resultCallback(result);
    });
  }

  shutdown(): Promise<void> {
    return this.exporter.shutdown();
  }
}

export function setupTracingProvider(resource: Resource): NodeTracerProvider {
  const exporter1 = new OTLPTraceExporter({
    url: `${process.env.OTEL_COLLECTOR_ENDPOINT}`,
  });
  const exporter = new DevExporter(exporter1);

  const provider = new NodeTracerProvider({
    resource,
    spanProcessors: [new SimpleSpanProcessor(exporter)],
    sampler: new AlwaysOnSampler(),
  });

  provider.register();

  console.log('OpenTelemetry tracer initialized');

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      await provider.shutdown();
      console.log('[tracing] shutdown complete');
    });
  });

  return provider;
}
