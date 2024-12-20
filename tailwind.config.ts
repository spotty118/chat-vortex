import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        sapphire: "#0F172A",
        electric: "#3B82F6",
        amethyst: "#8B5CF6",
        emerald: "#10B981",
        "neutral-light": "#F8FAFC",
        "neutral-dark": "#E2E8F0",
        alpha: {
          white: {
            5: 'rgba(255, 255, 255, 0.05)',
            10: 'rgba(255, 255, 255, 0.1)',
            20: 'rgba(255, 255, 255, 0.2)',
            30: 'rgba(255, 255, 255, 0.3)',
            40: 'rgba(255, 255, 255, 0.4)',
            50: 'rgba(255, 255, 255, 0.5)',
            60: 'rgba(255, 255, 255, 0.6)',
            70: 'rgba(255, 255, 255, 0.7)',
            80: 'rgba(255, 255, 255, 0.8)',
            90: 'rgba(255, 255, 255, 0.9)',
          },
          gray: {
            5: 'rgba(115, 115, 115, 0.05)',
            10: 'rgba(115, 115, 115, 0.1)',
            20: 'rgba(115, 115, 115, 0.2)',
            30: 'rgba(115, 115, 115, 0.3)',
            40: 'rgba(115, 115, 115, 0.4)',
            50: 'rgba(115, 115, 115, 0.5)',
            60: 'rgba(115, 115, 115, 0.6)',
            70: 'rgba(115, 115, 115, 0.7)',
            80: 'rgba(115, 115, 115, 0.8)',
            90: 'rgba(115, 115, 115, 0.9)',
          },
          accent: {
            5: 'rgba(139, 92, 246, 0.05)',
            10: 'rgba(139, 92, 246, 0.1)',
            20: 'rgba(139, 92, 246, 0.2)',
            30: 'rgba(139, 92, 246, 0.3)',
            40: 'rgba(139, 92, 246, 0.4)',
            50: 'rgba(139, 92, 246, 0.5)',
            60: 'rgba(139, 92, 246, 0.6)',
            70: 'rgba(139, 92, 246, 0.7)',
            80: 'rgba(139, 92, 246, 0.8)',
            90: 'rgba(139, 92, 246, 0.9)',
          },
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          50: '#F8F5FF',
          100: '#F0EBFF',
          200: '#E1D6FF',
          300: '#CEBEFF',
          400: '#B69EFF',
          500: '#9C7DFF',
          600: '#8A5FFF',
          700: '#7645E8',
          800: '#6234BB',
          900: '#502D93',
          950: '#2D1959',
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      backdropFilter: {
        'glass': 'blur(16px) saturate(180%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;