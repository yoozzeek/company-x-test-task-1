import {
  NodeTracerProvider,
  ReadableSpan,
  BatchSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import process from 'process';
import { ExportResultCode } from '@opentelemetry/core';

export function setupTracingProvider(resource: Resource): NodeTracerProvider {
  const exporter = new OTLPTraceExporter({
    url: `${process.env.OTEL_COLLECTOR_ENDPOINT}`,
  });
  // const exporter = new DevExporter(exporter1);

  const provider = new NodeTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
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
