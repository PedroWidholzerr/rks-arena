import type { Config } from "tailwindcss";

// Cores como "H S% L%" nas variáveis de src/index.css (tokens do DESIGN.md). O <alpha-value> mantém
// funcionando os modificadores de opacidade do shadcn, como bg-primary/90.
const cor = (variavel: string) => `hsl(var(--${variavel}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem" },
      screens: { "2xl": "1120px" },
    },
    extend: {
      fontFamily: {
        // A única família é Inter, com system-ui como reserva (DESIGN.md, Typography).
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        border: cor("border"),
        "border-strong": cor("border-strong"),
        input: cor("input"),
        ring: cor("ring"),
        background: cor("background"),
        foreground: cor("foreground"),
        surface: { DEFAULT: cor("surface"), muted: cor("surface-muted") },
        primary: { DEFAULT: cor("primary"), foreground: cor("primary-foreground") },
        secondary: { DEFAULT: cor("secondary"), foreground: cor("secondary-foreground") },
        destructive: { DEFAULT: cor("destructive"), foreground: cor("destructive-foreground") },
        muted: { DEFAULT: cor("muted"), foreground: cor("muted-foreground") },
        // O "accent" do shadcn é o fundo de hover, não o dourado (o dourado é "primary").
        accent: { DEFAULT: cor("accent"), foreground: cor("accent-foreground"), text: cor("accent-text"), soft: cor("accent-soft") },
        popover: { DEFAULT: cor("popover"), foreground: cor("popover-foreground") },
        card: { DEFAULT: cor("card"), foreground: cor("card-foreground") },
        success: { DEFAULT: cor("success"), soft: cor("success-soft") },
        danger: { DEFAULT: cor("danger"), soft: cor("danger-soft") },
        warning: { DEFAULT: cor("warning"), soft: cor("warning-soft") },
        info: { DEFAULT: cor("info"), soft: cor("info-soft") },
        live: { DEFAULT: cor("live"), foreground: cor("on-live") },
        chart: {
          1: cor("chart-1"),
          2: cor("chart-2"),
          3: cor("chart-3"),
          4: cor("chart-4"),
          5: cor("chart-5"),
          6: cor("chart-6"),
        },
        sidebar: {
          DEFAULT: cor("sidebar-background"),
          foreground: cor("sidebar-foreground"),
          primary: cor("sidebar-primary"),
          "primary-foreground": cor("sidebar-primary-foreground"),
          accent: cor("sidebar-accent"),
          "accent-foreground": cor("sidebar-accent-foreground"),
          border: cor("sidebar-border"),
          ring: cor("sidebar-ring"),
        },
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
      maxWidth: {
        conteudo: "1120px",
        formulario: "560px",
      },
      minHeight: {
        toque: "44px",
      },
      boxShadow: {
        // Única sombra do sistema: popovers, menus, diálogos e a gaveta móvel.
        flutuante: "var(--sombra-flutuante)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
