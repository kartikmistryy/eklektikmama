'use client';

import { useCart } from '../../lib/hooks/useCart';

export default function CartCount() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {itemCount}
    </span>
  );
}
