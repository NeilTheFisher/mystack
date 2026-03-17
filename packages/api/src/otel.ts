import { opentelemetry } from "@elysiajs/opentelemetry";
import { env } from "@mystack/env/server";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { IORedisInstrumentation } from "@opentelemetry/instrumentation-ioredis";
import { BatchSpanProcessor, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

const traceExporter = new OTLPTraceExporter({
  url: env.OTEL_TRACE_EXPORTER_URL,
});

export const openTelemetry = opentelemetry({
  serviceName: "mystack-api",
  spanProcessors: [
    env.ENV === "development"
      ? new SimpleSpanProcessor(traceExporter)
      : new BatchSpanProcessor(traceExporter),
  ],
  instrumentations: [
    ...getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-ioredis": {
        enabled: false,
      },
    }),
    new IORedisInstrumentation({
      requireParentSpan: false,
    }),
  ],
});
