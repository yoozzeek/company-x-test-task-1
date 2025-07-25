import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const exporter = new OTLPMetricExporter({
  url: process.env.OTEL_METRICS_COLLECTOR_URL,
});

const meterProvider = new MeterProvider({
  resource: new resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'fastify-app' }),
  readers: [
    new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: 1000,
    }),
  ],
});

export const meter = meterProvider.getMeter('service_meter');

export const userLoginCounter = meter.createCounter('user_login_total', {
  description: 'Total number of successful user logins',
});
