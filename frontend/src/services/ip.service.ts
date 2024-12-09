import axios from 'axios';

interface IpifyResponse {
  ip: string;
}

interface CloudflareTraceResponse {
  ip: string;
  ts: string;
  visit_scheme: string;
  uag: string;
  colo: string;
  http: string;
  loc: string;
  tls: string;
  sni: string;
  warp: string;
  gateway: string;
}

class IpService {
  private cachedIp: string = '0.0.0.0';

  async getClientIp(): Promise<string> {
    if (this.cachedIp !== '0.0.0.0') {
      return this.cachedIp;
    }

    try {
      // Usar ipify con CORS habilitado
      const response = await axios.get<IpifyResponse>('https://api64.ipify.org?format=json');
      if (response.data?.ip) {
        this.cachedIp = response.data.ip;
        return this.cachedIp;
      }
      throw new Error('No IP encontrada en la respuesta de ipify');
    } catch (error) {
      console.error('Error al obtener IP de ipify:', error);
      
      try {
        // Fallback a cloudflare trace que tiene CORS habilitado
        const response = await axios.get<string>('https://1.1.1.1/cdn-cgi/trace');
        const lines = response.data.split('\n');
        const data = lines.reduce<Partial<CloudflareTraceResponse>>((obj, line) => {
          const [key, value] = line.split('=');
          if (key && value) {
            obj[key as keyof CloudflareTraceResponse] = value;
          }
          return obj;
        }, {});
        
        if (data.ip) {
          this.cachedIp = data.ip;
          return this.cachedIp;
        }
        throw new Error('No IP encontrada en la respuesta del fallback');
      } catch (error) {
        console.error('Error al obtener IP del fallback:', error);
        return '0.0.0.0';
      }
    }
  }

  clearCache(): void {
    this.cachedIp = '0.0.0.0';
  }
}

export const ipService = new IpService();