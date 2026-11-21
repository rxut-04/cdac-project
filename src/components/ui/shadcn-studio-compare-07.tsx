import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type CompareIcon = string | { light: string; dark: string } | ReactNode;

export interface CompareColumnHeader {
  /** Image URL, light/dark pair, or React icon. */
  icon?: CompareIcon;
  title: string;
}

export interface CompareFeature {
  name: string;
  column1: ReactNode;
  column2: ReactNode;
  column3: ReactNode;
}

export interface ComparisonData {
  features: CompareFeature[];
  column1Header: CompareColumnHeader;
  column2Header: CompareColumnHeader;
  column3Header: string;
}

export interface Compare07Props {
  /** Comparison table content. */
  data?: ComparisonData;
  /** Section heading. */
  title?: string;
  /** Text under the heading. */
  description?: string;
  /** Label of the first (feature name) column. */
  featuresLabel?: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 UI primitives                              */
/* -------------------------------------------------------------------------- */

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md text-foreground flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 text-sm shadow-xl",
        className
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const emptyData: ComparisonData = {
  features: [],
  column1Header: { title: "" },
  column2Header: { title: "" },
  column3Header: "",
};

const headerCellClassName =
  "p-4 sm:p-5 text-left text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-white";

function HeaderIcon({ icon, className }: { icon: CompareIcon; className: string }) {
  if (React.isValidElement(icon)) {
    return <div className={cn("shrink-0", className)}>{icon}</div>;
  }

  if (typeof icon === "string") {
    return <img src={icon} alt="" className={className} />;
  }

  if (icon && typeof icon === "object" && "light" in icon && "dark" in icon) {
    return (
      <>
        <img src={icon.light} alt="" className={cn(className, "dark:hidden")} />
        <img src={icon.dark} alt="" className={cn(className, "hidden dark:block")} />
      </>
    );
  }

  return null;
}

function ColumnHeaderCell({
  header,
  iconClassName,
  className,
}: {
  header: CompareColumnHeader;
  iconClassName: string;
  className?: string;
}) {
  return (
    <th scope="col" className={cn(headerCellClassName, "w-64 min-w-[200px]")}>
      <div className={cn("flex items-center gap-3", className)}>
        {header.icon && <HeaderIcon icon={header.icon} className={iconClassName} />}
        <span>{header.title}</span>
      </div>
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Block                                   */
/* -------------------------------------------------------------------------- */

export const CompareUILib = ({
  data = emptyData,
  title = "How mygit Compares to Traditional VCS",
  description = "Understand the architectural advantages of a byte-compatible, self-hosted Git engine built from the ground up.",
  featuresLabel = "Architecture & Capabilities",
  className,
}: Compare07Props) => {
  return (
    <section
      id="compare"
      className={cn(
        "relative w-full py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto transition-colors duration-300",
        className
      )}
    >
      <div className="mx-auto space-y-10">
        {/* Section Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 text-xs font-semibold text-neutral-900 dark:text-neutral-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#b8ff3c] animate-pulse" />
            VCS Architecture Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-950 dark:text-white">
            {title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg leading-relaxed">
            {description}
          </p>
        </div>

        {/* Comparison Table Card */}
        <Card
          role="region"
          aria-label={title}
          tabIndex={0}
          className="focus-visible:ring-ring/50 overflow-hidden overflow-x-auto outline-none focus-visible:ring-2"
        >
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="bg-neutral-100/90 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
                <th scope="col" className={cn(headerCellClassName, "w-64 min-w-[200px]")}>
                  {featuresLabel}
                </th>
                <ColumnHeaderCell
                  header={data.column1Header}
                  iconClassName="size-6 sm:size-7"
                  className="min-w-[140px]"
                />
                <ColumnHeaderCell
                  header={data.column2Header}
                  iconClassName="size-6 sm:size-7"
                  className="min-w-[140px]"
                />
                <th scope="col" className={cn(headerCellClassName, "min-w-[220px]")}>
                  {data.column3Header}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
              {data.features.map((feature, index) => (
                <tr
                  key={feature.name}
                  className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <th scope="row" className="p-4 sm:p-5 text-left font-normal align-top">
                    <div className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                      <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mr-2">
                        {String(index + 1).padStart(2, "0")}.
                      </span>
                      {feature.name}
                    </div>
                  </th>
                  <td className="p-4 sm:p-5 align-top">
                    <div className="text-neutral-900 dark:text-neutral-100 text-sm font-medium leading-relaxed">
                      {feature.column1}
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 align-top">
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                      {feature.column2}
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 align-top">
                    <div className="text-neutral-700 dark:text-neutral-300 text-sm font-normal leading-relaxed">
                      {feature.column3}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
};

export default CompareUILib;
