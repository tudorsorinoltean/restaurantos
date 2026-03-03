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
const NOTES      = ['Aniversare', 'Ziua de naștere', 'Masă de business', 'Cerere în căsătorie', 'Alergii: gluten', 'Loc la fereastră', 'Botez', '', '', '']

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
  { name: 'Aperitive',  order: 0 },
  { name: 'Supe',       order: 1 },
  { name: 'Paste',      order: 2 },
  { name: 'Grătar',     order: 3 },
  { name: 'Deserturi',  order: 4 },
  { name: 'Băuturi',    order: 5 },
]

const MENU_ITEMS = [
  // Aperitive
  { categoryIndex: 0, name: 'Bruschette cu roșii',     description: 'Pâine prăjită cu roșii proaspete și busuioc', price: 22, available: true },
  { categoryIndex: 0, name: 'Carpaccio de vită',        description: 'Felii subțiri de vită cu rucola și parmezan',  price: 38, available: true },
  { categoryIndex: 0, name: 'Plăcintă cu brânză',       description: 'Plăcintă tradițională cu brânză de oaie',     price: 18, available: true },
  // Supe
  { categoryIndex: 1, name: 'Ciorbă de burtă',          description: 'Rețetă tradițională cu smântână și usturoi',  price: 24, available: true },
  { categoryIndex: 1, name: 'Supă cremă de dovleac',    description: 'Cu semințe de dovleac și ulei de trufe',      price: 22, available: true },
  // Paste
  { categoryIndex: 2, name: 'Spaghetti Carbonara',      description: 'Rețetă originală italiană cu guanciale',      price: 42, available: true },
  { categoryIndex: 2, name: 'Tagliatelle cu trufe',     description: 'Paste proaspete cu cremă de trufe negre',     price: 58, available: true },
  { categoryIndex: 2, name: 'Penne Arrabbiata',         description: 'Sos de roșii picant cu usturoi',              price: 36, available: false },
  // Grătar
  { categoryIndex: 3, name: 'Entrecôte 300g',           description: 'Carne de vită maturată, sos bearnez',        price: 89, available: true },
  { categoryIndex: 3, name: 'Pui la grătar',            description: 'Piept de pui cu legume la grătar',           price: 48, available: true },
  { categoryIndex: 3, name: 'Coaste de porc BBQ',       description: 'Marinate 24h, sos BBQ de casă',              price: 65, available: true },
  // Deserturi
  { categoryIndex: 4, name: 'Tiramisu',                 description: 'Rețetă clasică italiană',                    price: 24, available: true },
  { categoryIndex: 4, name: 'Lava cake cu ciocolată',   description: 'Servit cu înghețată de vanilie',             price: 28, available: true },
  { categoryIndex: 4, name: 'Papanași',                 description: 'Cu smântână și dulceață de vișine',          price: 22, available: true },
  // Băuturi
  { categoryIndex: 5, name: 'Apă minerală 0.5L',        description: '',                                           price: 8,  available: true },
  { categoryIndex: 5, name: 'Suc natural de portocale', description: 'Stors la comandă',                          price: 18, available: true },
  { categoryIndex: 5, name: 'Vin roșu Fetească Neagră', description: 'Cramele Recaș, 0.75L',                      price: 85, available: true },
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