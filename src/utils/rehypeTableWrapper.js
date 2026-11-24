/**
 * Rehype plugin that wraps each table in a focusable, horizontally scrollable
 * `div.table-wrapper`, so wide tables scroll inside the post on small screens
 * instead of widening the page. `tabindex="0"` lets keyboard users scroll it,
 * and `role="region"` with an `aria-label` makes the focus stop meaningful to
 * screen readers. An outer `div.table-block` carries the numbered block label
 * ("table 1", "table 2", ...), outside the scroller so it is never clipped.
 *
 * Options: `{ label }`, the accessible name of the region.
 *
 * Tables inside `<ResponsiveTable>` (MDX) are skipped: it has its own wrapper.
 */
export const rehypeTableWrapper =
  (options = {}) =>
  tree => {
    const { label = "Scrollable table" } = options;
    let count = 0;
    const wrap = node => {
      if (!node.children) return;
      if (node.type === "mdxJsxFlowElement" && node.name === "ResponsiveTable")
        return;

      node.children = node.children.map(child => {
        if (child.type === "element" && child.tagName === "table") {
          count += 1;
          return {
            type: "element",
            tagName: "div",
            properties: { className: ["table-block"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["block-label"],
                  ariaHidden: "true",
                  dataPagefindIgnore: true,
                },
                children: [{ type: "text", value: `table ${count}` }],
              },
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["table-wrapper"],
                  tabIndex: 0,
                  role: "region",
                  ariaLabel: label,
                },
                children: [child],
              },
            ],
          };
        }
        wrap(child);
        return child;
      });
    };

    wrap(tree);
  };
