"use client";

import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "./AddToCartButton";

export default function FoodCard({ dish }) {
  return (
    <article className="food-card">
      <Link href={`/menu/${dish.id}`} className="food-card-media" aria-label={`View ${dish.name} details`}>
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="food-card-img"
        />
      </Link>

      <div className="food-card-body">
        <div className="food-card-header">
          <h3 className="food-card-title">
            <Link href={`/menu/${dish.id}`}>{dish.name}</Link>
          </h3>
          <span className="food-card-price tabular">{dish.price} ETB</span>
        </div>

        <span className="dish-category">
          {dish.fasting ? "Fasting · Plant-based" : dish.category}
        </span>

        <p className="food-card-desc">{dish.summary || dish.ingredients}</p>

        <div className="food-card-controls">
          <Link href={`/menu/${dish.id}`} className="dish-details-link">
            Details
          </Link>
          <AddToCartButton dish={dish} />
        </div>
      </div>
    </article>
  );
}
