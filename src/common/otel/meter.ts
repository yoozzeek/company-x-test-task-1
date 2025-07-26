import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader, MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { Meter } from '@opentelemetry/api';

export function setupMeterProvider(resource: Resource): MeterProvider {
  const exporter = new OTLPMetricExporter({
    url: process.env.OTEL_COLLECTOR_ENDPOINT,
  });

  const provider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1000,
      }),
    ],
  });

  console.log('OpenTelemetry meter initialized');

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      await provider.shutdown();
      console.log('[metrics] shutdown complete');
    });
  });

  return provider;
}

export function buildAppCounters(meter: Meter) {
  return {
    serverRestarts: meter.createCounter('server_restarts', {
      description: 'Total number of server restarts',
    }),
    userLoginTotal: meter.createCounter('user_login_total', {
      description: 'Total number of successful user logins',
    }),
  };
}
