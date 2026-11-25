type Props = {
  id: string;
  message?: string;
};

/**
 * Error text linked to its input via aria-describedby (use errorProps).
 * Screen readers announce it when the invalid field receives focus.
 */
export function FieldError({ id, message }: Props) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-tarto-red">
      {message}
    </p>
  );
}

/** Spread onto an input: marks it invalid and points at its FieldError. */
export function errorProps(id: string, message?: string, describedBy?: string) {
  const ids = [describedBy, message ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return {
    "aria-invalid": message ? true : undefined,
    "aria-describedby": ids || undefined,
  } as const;
}

/** Moves focus to the first invalid field, in the order fields appear. */
export function focusFirstError(order: readonly string[], errors?: Record<string, unknown>) {
  if (!errors) return;
  const first = order.find((id) => errors[id]);
  if (first) document.getElementById(first)?.focus();
}
