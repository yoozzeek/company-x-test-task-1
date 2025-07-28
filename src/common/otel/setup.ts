import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { setupTracingProvider } from './tracer';
import { setupMeterProvider } from './meter';
import { FastifyOtelInstrumentation } from '@fastify/otel';

export default function setupOtelInstrumentation(serviceName: string) {
  const otelResource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: '0.0.1',
  });

  const tracerProvider = setupTracingProvider(otelResource);
  const tracer = tracerProvider.getTracer('service_tracer');

  const meterProvider = setupMeterProvider(otelResource);
  const meter = meterProvider.getMeter('service_meter');

  // registerInstrumentations({
  //   tracerProvider: tracerProvider,
  //   meterProvider: meterProvider,
  //   instrumentations: [new HttpInstrumentation()],
  // });

  const fastifyInstrumentation = new FastifyOtelInstrumentation({
    servername: serviceName,
    requestHook: (span, request) => {
      span.updateName(`HTTP ${request.method} ${request.url}`);
      span.setAttribute('http.method', request.method);
    },
  });
  fastifyInstrumentation.setTracerProvider(tracerProvider);
  fastifyInstrumentation.setMeterProvider(meterProvider);

  // const appCounters = buildAppCounters(meter);
  // appCounters.serverRestarts.add(1);

  return {
    tracer,
    meter,
    fastifyPlugin: fastifyInstrumentation.plugin(),
  };
}
