"use client";

import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "./AddToCartButton";
import Icon from "./Icon";

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
          <span className="food-card-price">{dish.price} <span style={{ fontSize: '0.7em', fontWeight: 500 }}>ETB</span></span>
        </div>

        <span className="dish-category">
          {dish.fasting ? (
            <>
              <Icon name="leaf" style={{ width: '0.9em', height: '0.9em' }} /> Fasting · Plant-based
            </>
          ) : (
            <>
              <Icon name="utensils" style={{ width: '0.9em', height: '0.9em' }} /> {dish.category}
            </>
          )}
          {dish.spicy && (
            <span style={{ color: 'var(--signal)', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <Icon name="flame" style={{ width: '0.85em', height: '0.85em' }} /> Spicy
            </span>
          )}
        </span>

        <p className="food-card-desc">{dish.summary || dish.ingredients}</p>

        <div className="food-card-meta">
          <span className="dish-prep-time">
            <Icon name="clock" style={{ width: '0.9em', height: '0.9em' }} />
            {dish.prepTime} min
          </span>
        </div>

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
