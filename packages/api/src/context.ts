export function resolveSession(_req: Request) {
  let session: { user: { id: string } } | null = null;

  if (!session) {
    session = {
      user: {
        id: "test-id",
      },
    };
  }

  return session;
}
