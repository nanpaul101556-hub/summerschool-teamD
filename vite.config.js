import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * V-World 의 JSON API(주소검색·지적도)는 CORS 헤더를 주지 않아서
 * 브라우저에서 직접 부를 수 없다. dev 서버가 대신 부른다.
 *
 * 인증키는 발급 시 등록한 도메인에서만 동작하므로 Referer 를 붙여 보낸다.
 * 배포에서는 같은 일을 api/vworld/[...path].js 가 한다 (vercel.json 이 /vworld 를 그리로 보낸다).
 * (타일 이미지는 <img> 로 받으므로 CORS 와 무관하다 — 프록시를 타지 않는다.)
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const origin = env.VITE_VWORLD_REFERER || 'http://localhost:5180/'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/vworld': {
          target: 'https://api.vworld.kr',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/vworld/, ''),
          headers: { Referer: origin },
        },
      },
    },
  }
})
