"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Epilogue() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow">La próxima ciudad</p>
          <h2 className="mt-5 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
            Avisame cuando toquen cerca.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-muted-foreground text-pretty">
            Una carta cuando salga un disco, se abra una sala o la gira
            cruce tu provincia. Sin ruido.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          {submitted ? (
            <p className="mt-10 font-display text-2xl text-primary">
              Ya estás en la lista.
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1 text-left">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email"
                  autoComplete="email"
                />
              </div>
              <Button type="submit">Escribime</Button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
