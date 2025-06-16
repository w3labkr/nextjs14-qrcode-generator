import 'next'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_URL: string

      CRON_SECRET: string
      JWT_SECRET: string

      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string

      DATABASE_URL: string
      DIRECT_URL: string

      EMAIL_SERVER: string
      EMAIL_SERVER_HOST: string
      EMAIL_SERVER_PORT: string
      EMAIL_SERVER_USER: string
      EMAIL_SERVER_PASSWORD: string
      EMAIL_FROM: string
      EMAIL_NAME: string
      EMAIL_BREVO_USER: string
      EMAIL_BREVO_PASS: string
      EMAIL_GMAIL_USER: string
      EMAIL_GMAIL_PASS: string

      AUTH_GITHUB_ID: string
      AUTH_GITHUB_SECRET: string
      AUTH_GOOGLE_ID: string
      AUTH_GOOGLE_SECRET: string
      AUTH_FACEBOOK_ID: string
      AUTH_FACEBOOK_SECRET: string
      AUTH_KAKAO_ID: string
      AUTH_KAKAO_SECRET: string
      AUTH_TWITTER_ID: string
      AUTH_TWITTER_SECRET: string

      [key: string]: string | undefined
    }
  }
}
