export type SshTunnel = { close: () => Promise<void> };

export async function createTunnel(_cfg: any): Promise<SshTunnel> {
  // Placeholder simplificado: en una implementación completa, crearíamos un túnel local -> remoto
  // con forwardOut/forwardIn. Para MVP, retornamos un objeto con close noop.
  // Nota: Fastify y Docker ya funcionarán sin SSH si se conecta directo o via red local.
  return {
    async close() {
      // noop
    },
  };
}


