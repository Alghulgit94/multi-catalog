"use client"

import { useState } from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATAFORMA } from "@/config/plataforma"
import type { Plan } from "@/config/planes"
import { PLANES, NOTA_CREDITOS, formatoGs } from "@/config/planes"
import { Boton } from "@/components/landing/ui/Boton"
import { track } from "@/lib/analytics/track"

type Periodo = "mensual" | "anual"

function PlanCard({ plan, periodo, nombrePlataforma }: { plan: Plan; periodo: Periodo; nombrePlataforma: string }) {
  const anual = periodo === "anual"
  const grande = anual ? formatoGs(plan.precioAnual / 12) : formatoGs(plan.precioMensual)
  const chico = anual && plan.precioAnual ? `${formatoGs(plan.precioAnual)} por año` : anual ? "Siempre gratis" : ""

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-plan bg-white px-7 py-8",
        plan.destacado ? "border-2 border-primario" : "border border-linea",
      )}
    >
      {plan.destacado && (
        <span className="absolute -top-[13px] left-7 inline-flex h-[26px] items-center rounded-full bg-nanduti-amarillo px-3 font-cuerpo text-[13px] font-semibold leading-none text-tinta">
          Más elegido
        </span>
      )}
      <h3 className="m-0 font-titulos text-[clamp(20px,2vw,24px)] font-semibold leading-[1.2]">{plan.nombre}</h3>
      <p className="m-0 mt-[6px] min-h-[45px] font-cuerpo text-[15px] leading-[1.5] text-texto-secundario">
        {plan.frase}
      </p>
      <div className="mt-6 flex flex-wrap items-baseline gap-[6px]">
        <span className="font-titulos text-[clamp(32px,3.4vw,40px)] font-bold leading-none tracking-[-0.02em]">
          {grande}
        </span>
        <span className="font-cuerpo text-[15px] leading-none text-texto-secundario">/mes</span>
      </div>
      <div className="mt-2 min-h-5 font-cuerpo text-[14px] leading-[1.4] text-texto-secundario">{chico}</div>
      <Boton
        href={`${PLATAFORMA.rutas.registro}?plan=${plan.id}`}
        variante={plan.destacado ? "primario" : "secundario"}
        className={cn(
          "mt-6 flex w-full border-[1.5px] hover:opacity-[.88]",
          plan.destacado
            ? "border-primario hover:bg-primario"
            : "border-tinta bg-transparent hover:bg-transparent hover:text-tinta",
        )}
        trackEvent="clic_plan"
        trackData={{ plan: plan.id, periodo }}
      >
        {plan.boton}
      </Boton>
      <ul className="m-0 mt-7 flex list-none flex-col gap-3 border-t border-linea p-0 pt-6">
        {plan.caracteristicas(nombrePlataforma).map((item) => (
          <li key={item} className="flex items-start gap-[10px] font-cuerpo text-[15px] leading-[1.45] text-tinta">
            <Check
              size={18}
              strokeWidth={1.75}
              className="mt-[2px] flex-none text-nanduti-verde"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Planes() {
  const [periodo, setPeriodo] = useState<Periodo>("mensual")

  return (
    <section id="planes" aria-labelledby="planes-t" className="katalo-seccion scroll-mt-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-[620px]">
            <h2
              id="planes-t"
              className="m-0 text-balance font-titulos text-[clamp(30px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]"
            >
              Empezá gratis. Crecé cuando lo necesites.
            </h2>
            <p className="m-0 mt-4 font-cuerpo text-[clamp(16px,1.5vw,18px)] leading-[1.6] text-texto-secundario">
              Sin comisiones por venta. Cancelás cuando quieras.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RadioGroupPrimitive.Root
              value={periodo}
              aria-label="Período de facturación"
              onValueChange={(v) => {
                setPeriodo(v as Periodo)
                track("cambio_periodo", { periodo: v })
              }}
              className="inline-flex rounded-boton border border-linea bg-white p-1"
            >
              {(["mensual", "anual"] as const).map((valor) => (
                <RadioGroupPrimitive.Item
                  key={valor}
                  value={valor}
                  className={cn(
                    "h-10 cursor-pointer rounded-[9px] border-0 px-[18px] font-cuerpo text-[15px] font-semibold leading-none",
                    periodo === valor ? "bg-tinta text-white" : "bg-transparent text-tinta",
                  )}
                >
                  {valor === "mensual" ? "Mensual" : "Anual"}
                </RadioGroupPrimitive.Item>
              ))}
            </RadioGroupPrimitive.Root>
            <span
              className={cn(
                "font-cuerpo text-[14px] font-semibold leading-none text-nanduti-verde",
                periodo === "mensual" ? "opacity-55" : "opacity-100",
              )}
            >
              2 meses gratis
            </span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-stretch gap-6">
          {PLANES.map((plan) => (
            <PlanCard key={plan.id} plan={plan} periodo={periodo} nombrePlataforma={PLATAFORMA.nombre} />
          ))}
        </div>
        <p className="m-0 mt-6 font-cuerpo text-[14px] leading-[1.5] text-texto-secundario">{NOTA_CREDITOS}</p>
      </div>
    </section>
  )
}
