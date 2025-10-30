import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WebhookDetails } from "../components/webhook-details";

export const Route = createFileRoute('/webhooks/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <React.Suspense fallback={<p>Carregando...</p>}>
      <WebhookDetails id={id} />
    </React.Suspense>
  )
}