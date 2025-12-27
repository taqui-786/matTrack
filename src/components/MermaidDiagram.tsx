import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && chart) {
      // Initialize mermaid with better theme and sizing
      mermaid.initialize({
        startOnLoad: true,
        theme: "base",
        themeVariables: {
          primaryColor: "#60a5fa",
          primaryTextColor: "#1e293b",
          primaryBorderColor: "#3b82f6",
          lineColor: "#64748b",
          secondaryColor: "#a78bfa",
          tertiaryColor: "#f472b6",
          fontSize: "16px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          // Text colors
          labelTextColor: "#1e293b",
          textColor: "#1e293b",
          nodeTextColor: "#ffffff",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 10,
          nodeSpacing: 50,
          rankSpacing: 50,
        },
        pie: {
          textPosition: 0.55,
        },
      });

      // Generate a unique ID for this diagram
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

      // Render the diagram
      mermaid.render(id, chart).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          // Find the SVG element and modify its attributes
          const svgElement = containerRef.current.querySelector("svg");
          if (svgElement) {
            // Store original viewBox or create one
            const viewBox = svgElement.getAttribute("viewBox");
            if (viewBox) {
              svgElement.setAttribute("viewBox", viewBox);
            }

            // Make it responsive but constrained
            svgElement.style.maxWidth = "100%";
            svgElement.style.height = "auto";
            svgElement.setAttribute("width", "100%");
            svgElement.removeAttribute("height");
          }
        }
      });
    }
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className={`mermaid-container ${className}`}
      style={{ maxWidth: "400px", margin: "0 auto" }}
    />
  );
}
