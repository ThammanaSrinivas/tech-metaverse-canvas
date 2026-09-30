
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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// ZenMode brand primitives (theme-independent). Semantic colours above follow light/dark.
				zen: { 900: '#0B5C12', 700: '#0F7A18', 500: '#2AA136', 300: '#5BDF62', 100: '#BFF3C2', 50: '#E6F6E7' },
				amber: { 800: '#7A5A00', 500: '#FFC800', 50: '#FFF8E1' },
				ember: { 700: '#B34700', 500: '#FF6600', 300: '#FF8A3D' },
				tint: { DEFAULT: 'hsl(var(--tint))', line: 'hsl(var(--tint-line))' },
				reward: { DEFAULT: 'hsl(var(--reward))', surface: 'hsl(var(--reward-surface))' },
				highlight: 'hsl(var(--highlight) / <alpha-value>)',
				// Warm neutrals so legacy gray-* classes (Coding Duel) stay quiet next to any palette.
				gray: { 50: '#FAF9F5', 100: '#F2F1ED', 200: '#DBD9D2', 300: '#C9C8C1', 400: '#9E9E98', 500: '#70726A', 600: '#5E6058', 700: '#2B2B2B', 800: '#222222', 900: '#1A1A1A', 950: '#111111' }
			},
			fontFamily: {
				display: ['"Clash Display"', 'Geist', 'system-ui', 'sans-serif'],
				sans: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
				mono: ['"Departure Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.5',
						transform: 'scale(1.05)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-20px)'
					}
				},
				'slide-in-up': {
					'0%': {
						transform: 'translateY(100px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				'grid-move': {
					'0%': {
						transform: 'translateY(0)'
					},
					'100%': {
						transform: 'translateY(-100px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'slide-in-up': 'slide-in-up 0.5s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'grid-move': 'grid-move 20s linear infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
