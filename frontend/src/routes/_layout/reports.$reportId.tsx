import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/reports/$reportId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello!</div>
}
