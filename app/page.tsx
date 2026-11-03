"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name: string; slug: string; description: string | null };
type Product = { id: string; name: string; slug: string; description: string | null; price_kes: number; images: string[] | null; is_featured: boolean; category_id: string | null };

const money = (value: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const [cats, items] = await Promise.all([
        supabase.from("categories").select("id,name,slug,description").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("id,name,slug,description,price_kes,images,is_featured,category_id").eq("is_published", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false })
      ]);
      if (!alive) return;
      if (cats.data) setCategories(cats.data as Category[]);
      if (items.data) setProducts(items.data as Product[]);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  const visibleProducts = useMemo(() => category === "all" ? products : products.filter(p => p.category_id === category), [category, products]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !supabase) { setNotice("Ordering is being set up. Please use the enquiry form below."); return; }
    const form = new FormData(event.currentTarget);
    const customer_name = String(form.get("name") || "").trim();
    const customer_phone = String(form.get("phone") || "").trim();
    const customer_email = String(form.get("email") || "").trim();
    const delivery_location = String(form.get("location") || "").trim();
    const quantity = Math.max(1, Math.min(20, Number(form.get("quantity") || 1)));
    setSending(true); setNotice("");
    const { error } = await supabase.from("orders").insert({ customer_name, customer_phone, customer_email: customer_email || null, delivery_location, items: [{ product_id: selected.id, name: selected.name, quantity, unit_price_kes: selected.price_kes }], subtotal_kes: selected.price_kes * quantity, delivery_fee_kes: 0, total_kes: selected.price_kes * quantity, customer_note: "Website order request. Delivery fee to be confirmed.", status: "pending" });
    setSending(false);
    if (error) { setNotice("We couldn't submit that request just now. Please try again or send us an enquiry."); return; }
    setNotice("Your order request has been received. Our team will contact you to confirm availability and delivery.");
    setSelected(null);
  }

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setNotice("Our enquiry form is being connected. Please check back shortly."); return; }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSending(true); setNotice("");
    const { error } = await supabase.from("store_enquiries").insert({ customer_name: String(form.get("enquiryName") || "").trim(), customer_phone: String(form.get("enquiryPhone") || "").trim(), customer_email: String(form.get("enquiryEmail") || "").trim() || null, subject: String(form.get("subject") || "General store enquiry").trim(), message: String(form.get("message") || "").trim(), preferred_store: String(form.get("preferredStore") || "Kenya").trim(), status: "new" });
    setSending(false);
    if (error) { setNotice("We couldn't send your enquiry. Please try again."); return; }
    formElement.reset(); setNotice("Thank you. Your enquiry has been sent to MAVÉRA.");
  }

  return <main>
    <div className="announcement">A quieter kind of luxury · Thoughtfully selected for Kenyan homes</div>
    <header className="header"><a className="wordmark" href="#" aria-label="MAVÉRA home">MAVÉRA<span>.</span></a><nav><a href="#collections">Collections</a><a href="#about">Our philosophy</a><a href="#visit">Visit & enquire</a></nav><a className="header-cta" href="#collections">Explore the edit <span>↗</span></a></header>
    <section className="hero"><div className="hero-image" role="img" aria-label="Warm, minimal contemporary living room"></div><div className="hero-shade"></div><div className="hero-copy"><p className="eyebrow light">THE ART OF FEELING AT HOME</p><h1>Make room<br/>for <em>beautiful</em><br/>living.</h1><p className="hero-description">Furniture and home pieces chosen to bring warmth, character and calm into the spaces that matter.</p><a className="button button-light" href="#collections">Discover MAVÉRA <span>↗</span></a><div className="hero-index">01 <i></i> A MORE CONSIDERED HOME</div></div><div className="hero-side-note">DESIGNED FOR LIVING · MADE TO LAST</div></section>
    <section className="intro" id="about"><p className="eyebrow">A NOTE ON LIVING</p><h2>Good spaces aren't simply seen.<br/><em>They're felt.</em></h2><p>We believe the pieces we live with should do more than fill a room. They should make everyday moments feel a little more intentional.</p></section>
    <section className="collection-section" id="collections"><div className="section-top"><div><p className="eyebrow">THE MAVÉRA EDIT</p><h2>Find your <em>feeling.</em></h2></div><p>Explore considered pieces for<br/>the way you live.</p></div>
      <div className="category-row"><button className={category === "all" ? "filter active" : "filter"} onClick={() => setCategory("all")}>All pieces</button>{categories.map(c => <button key={c.id} className={category === c.id ? "filter active" : "filter"} onClick={() => setCategory(c.id)}>{c.name}</button>)}</div>
      {!supabase && <p className="empty-state">Connect the MAVÉRA catalogue to display products.</p>}
      {loading ? <p className="empty-state">Preparing the collection…</p> : visibleProducts.length === 0 ? <div className="empty-state"><span className="empty-mark">M.</span><h3>The collection is taking shape.</h3><p>Our first pieces will appear here soon. In the meantime, send us an enquiry and tell us what you are looking for.</p><a href="#visit" className="text-link">Make an enquiry ↗</a></div> : <div className="product-grid">{visibleProducts.map((p, i) => <article className="product-card" key={p.id}><button className="product-image" onClick={() => setSelected(p)} aria-label={`Enquire about ${p.name}`} style={{ backgroundImage: p.images?.[0] ? `url("${p.images[0]}")` : "linear-gradient(135deg,#ddd4c7,#b9aa97)" }}><span className="product-number">0{i + 1}</span><span className="quick-view">View piece ↗</span></button><div className="product-info"><div><h3>{p.name}</h3><p>{p.description || "A considered piece for your home."}</p></div><strong>{money(p.price_kes)}</strong></div><button className="product-enquire" onClick={() => setSelected(p)}>Enquire / order <span>↗</span></button></article>)}</div>}
    </section>
    <section className="quote-band"><p className="eyebrow light">THE MAVÉRA POINT OF VIEW</p><h2>Less, but with<br/><em>more meaning.</em></h2><p>Thoughtful details. Honest materials. Spaces that feel like you.</p></section>
    <section className="visit-section" id="visit"><div className="visit-copy"><p className="eyebrow">LET'S MAKE IT YOURS</p><h2>Something on<br/>your <em>mind?</em></h2><p>Looking for a particular piece, placing an order, or interested in speaking with our team about a store visit? Leave us a note.</p><div className="contact-note"><span>01 / ONLINE ENQUIRIES</span><span>02 / STORE & PRODUCT QUESTIONS</span><span>03 / DELIVERY DISCUSSIONS</span></div></div><form className="enquiry-form" onSubmit={submitEnquiry}><label>Your name<input name="enquiryName" required minLength={2} maxLength={120} placeholder="Full name"/></label><div className="form-pair"><label>Phone number<input name="enquiryPhone" required minLength={7} maxLength={30} placeholder="+254 …"/></label><label>Email address<input name="enquiryEmail" type="email" placeholder="you@example.com"/></label></div><label>What can we help with?<input name="subject" required minLength={2} maxLength={160} placeholder="Product, order or store enquiry"/></label><label>Message<textarea name="message" required minLength={5} maxLength={3000} rows={4} placeholder="Tell us a little more…"/></label><input name="preferredStore" type="hidden" value="Kenya"/><button className="button button-dark" disabled={sending}>{sending ? "Sending…" : "Send enquiry"} <span>↗</span></button></form></section>
    <footer><a className="wordmark footer-logo" href="#">MAVÉRA<span>.</span></a><p>Considered living, beautifully made.</p><div><a href="#collections">Collections</a><a href="#about">Our philosophy</a><a href="#visit">Contact</a></div><small>© {new Date().getFullYear()} MAVÉRA. All rights reserved.</small><div className="developer-credit"><span>WEBSITE BY</span><strong>Junior Williams</strong><small>Web Developer · Digital Solutions</small></div></footer>
    {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="order-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button><p className="eyebrow">A MAVÉRA PIECE</p><h2>{selected.name}</h2><p className="modal-price">{money(selected.price_kes)}</p><p className="modal-intro">Send an order request. Our team will contact you to confirm stock, delivery arrangements and final costs.</p><form onSubmit={submitOrder}><label>Your name<input name="name" required minLength={2} maxLength={120}/></label><label>Phone number<input name="phone" required minLength={7} maxLength={30} placeholder="+254 …"/></label><label>Email (optional)<input name="email" type="email"/></label><label>Delivery location<input name="location" required minLength={2} maxLength={250} placeholder="Town / area"/></label><label>Quantity<input name="quantity" type="number" min="1" max="20" defaultValue="1" required/></label><button className="button button-dark" disabled={sending}>{sending ? "Submitting…" : "Submit order request"} ↗</button></form></section></div>}
  </main>;
}
