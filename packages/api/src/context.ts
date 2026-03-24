// oxlint-disable-next-line require-await
export async function resolveSession(_req: Request) {
  const session = {
    user: {
      id: "test-id",
    },
  };

  return session;
}
