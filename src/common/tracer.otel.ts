import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyOtelInstrumentation } from '@fastify/otel';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import process from 'process';

export function setupTracing(serviceName: string) {
  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_TRACES_COLLECTOR_URL,
  });

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
    sampler: new AlwaysOnSampler(),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [new HttpInstrumentation(), new FastifyOtelInstrumentation()],
  });

  provider.register();

  console.log(`[tracing] OpenTelemetry initialized for: ${serviceName}`);

  ['SIGINT', 'SIGTERM'].forEach((_) => async () => {
    await provider.shutdown();
    console.log('[tracing] shutdown complete');
  });
}
