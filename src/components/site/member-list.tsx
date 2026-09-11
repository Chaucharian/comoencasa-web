"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { members } from "@/lib/data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ease = [0.22, 1, 0.36, 1] as const;

export function MemberList() {
  const [open, setOpen] = useState<string | undefined>(undefined);
  const reduce = useReducedMotion();

  return (
    <Accordion
      type="single"
      collapsible
      value={open}
      onValueChange={setOpen}
      className="border-t border-foreground/10"
    >
      {members.map((member) => {
        const cropScale = "imageScale" in member ? member.imageScale : 1;
        const isOpen = open === member.name;

        return (
          <AccordionItem key={member.name} value={member.name}>
            <AccordionTrigger className="py-5">
              <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
                <span className="font-display text-2xl leading-none">{member.name}</span>
                <span className="shrink-0 text-right text-sm text-muted-foreground">
                  {member.role}
                </span>
              </span>
            </AccordionTrigger>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key={member.name}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={reduce ? false : { y: 28, scale: 1.04 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={reduce ? undefined : { y: 16, scale: 1.02 }}
                    transition={{ duration: 0.75, ease }}
                    className="relative mb-6 aspect-[4/5] origin-top overflow-hidden bg-secondary"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 28vw, 90vw"
                      className="object-cover"
                      style={{
                        objectPosition: member.imagePosition,
                        transformOrigin: member.imagePosition,
                        transform: cropScale !== 1 ? `scale(${cropScale})` : undefined,
                      }}
                    />
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
