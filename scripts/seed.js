// scripts/seed.js
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { faker } from '@faker-js/faker/locale/ro'
import * as dotenv from 'dotenv'
dotenv.config()

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// ── Config ───────────────────────────────────────────────
const STATUSES   = ['pending', 'confirmed', 'arrived', 'cancelled', 'no_show']
const STATUS_W   = [15, 40, 25, 15, 5] // probabilitate per status (sumă = 100)
const TIMES      = ['12:00','12:30','13:00','13:30','14:00','18:00','18:30','19:00','19:30','20:00','20:30','21:00']
const NOTES      = ['Anniversary', 'Birthday', 'Business dinner', 'Marriage proposal', 'Allergies: gluten', 'Window seat', 'Baptism', '', '', '']

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return items[i]
  }
  return items[items.length - 1]
}

function randomDate(daysBack = 60, daysForward = 30) {
  const d = new Date()
  d.setDate(d.getDate() - daysBack + Math.floor(Math.random() * (daysBack + daysForward)))
  return d.toISOString().split('T')[0]
}

// ── Categorii și produse meniu ───────────────────────────
const MENU_CATEGORIES = [
  { name: 'Starters',  order: 0 },
  { name: 'Soups',     order: 1 },
  { name: 'Pasta',     order: 2 },
  { name: 'Grill',     order: 3 },
  { name: 'Desserts',  order: 4 },
  { name: 'Drinks',    order: 5 },
]

const MENU_ITEMS = [
  // Starters
  { categoryIndex: 0, name: 'Tomato Bruschetta',          description: 'Toasted bread with fresh tomatoes and basil',       price: 22, available: true },
  { categoryIndex: 0, name: 'Beef Carpaccio',             description: 'Thin slices of beef with rocket and parmesan',      price: 38, available: true },
  { categoryIndex: 0, name: 'Cheese Pie',                 description: 'Traditional pie with sheep cheese',                 price: 18, available: true },
  // Soups
  { categoryIndex: 1, name: 'Tripe Soup',                 description: 'Traditional recipe with sour cream and garlic',     price: 24, available: true },
  { categoryIndex: 1, name: 'Pumpkin Cream Soup',         description: 'With pumpkin seeds and truffle oil',                price: 22, available: true },
  // Pasta
  { categoryIndex: 2, name: 'Spaghetti Carbonara',        description: 'Original Italian recipe with guanciale',            price: 42, available: true },
  { categoryIndex: 2, name: 'Truffle Tagliatelle',        description: 'Fresh pasta with black truffle cream',              price: 58, available: true },
  { categoryIndex: 2, name: 'Penne Arrabbiata',           description: 'Spicy tomato sauce with garlic',                   price: 36, available: false },
  // Grill
  { categoryIndex: 3, name: 'Entrecôte 300g',             description: 'Aged beef, béarnaise sauce',                       price: 89, available: true },
  { categoryIndex: 3, name: 'Grilled Chicken',            description: 'Chicken breast with grilled vegetables',           price: 48, available: true },
  { categoryIndex: 3, name: 'BBQ Pork Ribs',              description: 'Marinated 24h, homemade BBQ sauce',                price: 65, available: true },
  // Desserts
  { categoryIndex: 4, name: 'Tiramisu',                   description: 'Classic Italian recipe',                           price: 24, available: true },
  { categoryIndex: 4, name: 'Chocolate Lava Cake',        description: 'Served with vanilla ice cream',                    price: 28, available: true },
  { categoryIndex: 4, name: 'Romanian Donuts',            description: 'With sour cream and cherry jam',                   price: 22, available: true },
  // Drinks
  { categoryIndex: 5, name: 'Mineral Water 0.5L',         description: '',                                                 price: 8,  available: true },
  { categoryIndex: 5, name: 'Fresh Orange Juice',         description: 'Freshly squeezed',                                 price: 18, available: true },
  { categoryIndex: 5, name: 'Fetească Neagră Red Wine',   description: 'Cramele Recaș, 0.75L',                             price: 85, available: true },
]

// ── Seed funcții ─────────────────────────────────────────
async function seedReservations(count = 40) {
  console.log(`\n📅 Adaug ${count} rezervări...`)
  for (let i = 0; i < count; i++) {
    await addDoc(collection(db, 'reservations'), {
      name:      faker.person.fullName(),
      phone:     faker.phone.number('07########'),
      email:     faker.internet.email(),
      date:      randomDate(45, 20),
      time:      TIMES[Math.floor(Math.random() * TIMES.length)],
      persons:   Math.floor(Math.random() * 7) + 1,
      status:    weightedRandom(STATUSES, STATUS_W),
      notes:     NOTES[Math.floor(Math.random() * NOTES.length)],
      createdAt: Timestamp.now(),
    })
    process.stdout.write(`\r  ${i + 1}/${count}`)
  }
  console.log('\n  ✅ Rezervări adăugate')
}

async function seedMenu() {
  console.log('\n🍽  Adaug meniu...')
  const catIds = []
  for (const cat of MENU_CATEGORIES) {
    const ref = await addDoc(collection(db, 'menu_categories'), {
      ...cat, createdAt: Timestamp.now()
    })
    catIds.push(ref.id)
    console.log(`  ✅ Categorie: ${cat.name}`)
  }
  for (const item of MENU_ITEMS) {
    await addDoc(collection(db, 'menu_items'), {
      name:        item.name,
      description: item.description,
      price:       item.price,
      available:   item.available,
      categoryId:  catIds[item.categoryIndex],
      createdAt:   Timestamp.now(),
    })
  }
  console.log(`  ✅ ${MENU_ITEMS.length} produse adăugate`)
}

async function main() {
  console.log('🌱 RestaurantOS — Seed Script')
  console.log('================================')
  try {
    await seedReservations(40)
    await seedMenu()
    console.log('\n✅ Seed complet! Deschide aplicația să vezi datele.')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Eroare:', err.message)
    process.exit(1)
  }
}

main()