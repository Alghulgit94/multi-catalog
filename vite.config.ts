import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

// El proyecto usa zod 3 y Better Auth trae su propio zod 4. Si Vite pre-empaqueta
// "zod" una sola vez, Better Auth recibe la versión equivocada (`.loose is not a
// function`): se deja sin pre-empaquetar para que cada paquete resuelva la suya.
const keepZodPerPackage = { optimizeDeps: { exclude: ["zod"] } }

export default defineConfig({
  optimizeDeps: { exclude: ["zod"] },
  environments: { rsc: keepZodPerPackage, ssr: keepZodPerPackage },
  plugins: [
    // Tailwind como plugin de Vite (el loader de PostCSS falla dentro del runner de workerd).
    tailwindcss(),
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
