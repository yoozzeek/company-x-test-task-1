import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader, MeterProvider } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import process from 'process';

export function setupMeterProvider(serviceName: string): MeterProvider {
  const exporter = new OTLPMetricExporter({
    url: process.env.OTEL_METRICS_COLLECTOR_URL,
  });

  const provider = new MeterProvider({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
    readers: [
      new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1000,
      }),
    ],
  });

  console.log(`[metrics] OpenTelemetry meter initialized for: ${serviceName}`);

  ['SIGINT', 'SIGTERM'].forEach((signal) => async () => {
    process.on(signal, async () => {
      await provider.shutdown();
      console.log('[metrics] shutdown complete');
    });
  });

  return provider;
}

export function buildAppCounters(serviceName: string, provider: MeterProvider) {
  const meter = provider.getMeter(serviceName);
  return {
    serverRestarts: meter.createCounter('server_restarts', {
      description: 'Total number of server restarts',
    }),
    userLoginTotal: meter.createCounter('user_login_total', {
      description: 'Total number of successful user logins',
    }),
  };
}
