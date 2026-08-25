export class LocalBus {
  constructor() { this.handlers = new Map(); }
  subscribe(topic, handler) { this.handlers.set(topic, handler); }
  publish(topic, message) {
    const handler = this.handlers.get(topic);
    if (!handler) throw new Error(`no handler for topic ${topic}`);
    setImmediate(() => handler(structuredClone(message)));
  }
}
