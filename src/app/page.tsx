import Link from "next/link";

const stats = [
  { label: "Studio & space booked", value: "2.4k+" },
  { label: "Creative providers", value: "180+" },
  { label: "Average booking time", value: "12 min" },
];

const features = [
  {
    title: "Creative spaces",
    text: "Book premium studios, shooting rooms, and event spaces tailored for campaigns, productions, and portfolio sessions.",
    icon: "🎬",
  },
  {
    title: "Equipment rental",
    text: "Access cameras, lighting kits, audio gear, and production tools from vetted local providers.",
    icon: "📷",
  },
  {
    title: "Service packages",
    text: "Bundle photography, styling, editing, and production support into one seamless booking flow.",
    icon: "✨",
  },
];

const categories = [
  { name: "Photography Studio", image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80" },
  { name: "Brand Campaign", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" },
  { name: "Production Room", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80" },
];

const steps = [
  { number: "01", title: "Discover", text: "Browse spaces, equipment and packages by creative use case." },
  { number: "02", title: "Reserve", text: "Pick availability and confirm booking in a few taps." },
  { number: "03", title: "Create", text: "Deliver your shoot confidently with trusted local experts." },
];

const testimonials = [
  { quote: "We booked a full production setup in under 20 minutes. The workflow was smooth from start to finish.", author: "Mina Tran", role: "Brand Producer" },
  { quote: "It feels like a premium marketplace built for creative teams. The provider experience is especially strong.", author: "Daniel Park", role: "Studio Owner" },
  { quote: "The booking flow was quick, transparent, and the provider list felt curated for the job we needed.", author: "Alicia Frost", role: "Creative Director" },
  { quote: "We saved hours coordinating equipment and spaces. It feels like a proper production workflow, not just a booking tool.", author: "Ravi Nair", role: "Production Lead" },
];

const categoryMarquee = [
  "Photography studio",
  "Brand campaign",
  "Production room",
  "Event venue",
  "Portrait setup",
  "Lighting lab",
  "Studio rental",
  "Editorial shoot",
];

const valuePoints = [
  "Search by occasion, equipment, style, and venue type.",
  "Compare providers, availability, and package pricing in one view.",
  "Keep bookings, schedules, and service details in one workflow.",
];

const userRoles = [
  {
    title: "For brands",
    text: "Plan shoots faster with a single source for studio access, crew support, and production tools.",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
    imageDescription: "A creative team collaborating around a table",
  },
  {
    title: "For creators",
    text: "Find spaces that match your creative direction and book the exact setup you need.",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=900&q=85",
    imageDescription: "A photographer working with a camera on set",
  },
  {
    title: "For providers",
    text: "Showcase inventory, automate bookings, and manage availability without operational friction.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    imageDescription: "A bright creative studio ready for production",
  },
];

export default function Home() {
  return (
    <main className="landing-page min-h-screen bg-[#f7f7f2] text-[#171715]">
      <header className="landing-header mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8 lg:px-10">
        <div className="reveal reveal-delay-1 flex items-center justify-between rounded-full border border-[#e8e3d7] bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(27,29,24,0.04)] backdrop-blur-sm sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6a83f] bg-[#f8edd9] text-xs font-bold text-[#171715]">
              FP
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] text-[#171715]">FILM PHOTO</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-[#4a4a46] md:flex">
            <Link href="#features" className="transition hover:text-[#171715]">Features</Link>
            <Link href="#categories" className="transition hover:text-[#171715]">Categories</Link>
            <Link href="#how-it-works" className="transition hover:text-[#171715]">How it works</Link>
            <Link href="#reviews" className="transition hover:text-[#171715]">Reviews</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full border border-[#d9d4c7] px-4 py-2 text-sm font-medium text-[#1b1b18] transition hover:bg-[#f4f1ea] sm:inline-flex">
              Sign in
            </Link>
            <Link href="/register" className="inline-flex rounded-full bg-[#171715] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d2c29]">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
        <div className="reveal reveal-delay-2 overflow-hidden rounded-[28px] border border-[#e7e1d3] bg-[#f0ece3] shadow-[0_18px_50px_rgba(20,20,18,0.08)]">
          <div className="grid items-center gap-8 px-6 py-8 sm:px-8 md:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
            <div className="space-y-7">
              <div className="reveal reveal-delay-3 inline-flex items-center gap-2 rounded-full border border-[#e5d7b4] bg-[#fffaf0] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a21]">
                Creative booking platform
              </div>

              <div className="space-y-5">
                <h1 className="reveal reveal-delay-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] text-[#171715] sm:text-5xl lg:text-6xl">
                  Book creative spaces, gear, and production support in one place.
                </h1>
                <p className="reveal reveal-delay-5 max-w-lg text-base leading-8 text-[#565652] sm:text-lg">
                  Film Photo helps teams reserve studios, rent equipment, and manage service packages with a faster, cleaner booking experience.
                </p>
              </div>

              <div className="reveal reveal-delay-6 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex rounded-full bg-[#171715] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#2d2c29] hover:shadow-[0_12px_24px_rgba(23,23,21,0.18)]">
                  Start booking
                </Link>
                <Link href="/login" className="inline-flex rounded-full border border-[#d8d2c8] bg-white px-6 py-3 text-sm font-semibold text-[#171715] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f8f6f2]">
                  Sign in
                </Link>
              </div>

              <div className="reveal reveal-delay-7 flex flex-wrap gap-6 pt-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="min-w-[120px]">
                    <div className="text-2xl font-semibold tracking-[-0.05em] text-[#171715]">{stat.value}</div>
                    <div className="mt-1 text-sm text-[#666560]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="float-card relative">
              <div className="absolute -left-6 top-10 h-36 w-36 rounded-full bg-[#d6a83f]/20 blur-3xl" />
              <div className="absolute -right-4 bottom-6 h-32 w-32 rounded-full bg-[#161615]/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[26px] border border-white/60 bg-white/80 p-4 shadow-[0_30px_60px_rgba(13,13,13,0.12)] backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_65px_rgba(13,13,13,0.16)]">
                <div
                  className="h-[420px] rounded-[20px] border border-white/30 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(20,20,20,0.14), rgba(20,20,20,0.48)), url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />

                <div className="absolute inset-x-8 bottom-8 rounded-[20px] border border-white/50 bg-[#fffdfa]/90 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.12)] backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#807d74]">Featured session</p>
                      <h2 className="mt-2 text-xl font-semibold text-[#171715]">Golden Frame Studio</h2>
                    </div>
                    <div className="rounded-full bg-[#f0ead7] px-2.5 py-1 text-xs font-semibold text-[#7c5d1a]">4.9/5</div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-[#4d4d48]">
                    <div className="rounded-2xl bg-[#f7f4ee] p-3">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#7d7b74]">Type</div>
                      <div className="mt-1 font-semibold text-[#171715]">Studio</div>
                    </div>
                    <div className="rounded-2xl bg-[#f7f4ee] p-3">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#7d7b74]">Price</div>
                      <div className="mt-1 font-semibold text-[#171715]">$280</div>
                    </div>
                    <div className="rounded-2xl bg-[#f7f4ee] p-3">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-[#7d7b74]">Slots</div>
                      <div className="mt-1 font-semibold text-[#171715]">4 left</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a21]">Why Film Photo</p>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#171715] sm:text-4xl">
              A booking platform built for the pace of modern creative work.
            </h2>
            <p className="max-w-xl text-base leading-8 text-[#585754]">
              Creative projects move fast. Teams need more than a calendar—they need a reliable marketplace for spaces, gear, and support services that can move with the briefing, the moodboard, and the deadline.
            </p>

            <div className="space-y-4">
              {valuePoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-[#e7e1d3] bg-white/80 p-4 shadow-[0_8px_18px_rgba(23,23,21,0.03)]">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#f4e4b9] text-sm text-[#171715]">✓</span>
                  <p className="text-base text-[#3d3d39]">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {userRoles.map((role, index) => (
              <details key={role.title} className={`role-flip-card reveal reveal-delay-${index + 1}`}>
                <summary className="role-flip-inner">
                  <span className="role-flip-front">
                    <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4e4b9] text-xl text-[#171715]">{index + 1}</span>
                    <span className="text-xl font-semibold text-[#171715]">{role.title}</span>
                    <span className="mt-3 text-base leading-7 text-[#585754]">{role.text}</span>
                    <span className="role-flip-hint">Click to see more</span>
                  </span>
                  <span
                    className="role-flip-back"
                    role="img"
                    aria-label={role.imageDescription}
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(20,20,20,0.02), rgba(20,20,20,0.72)), url('${role.image}')`,
                    }}
                  >
                    <span className="text-xl font-semibold text-white">{role.title}</span>
                    <span className="mt-2 text-sm text-white/85">A place for great work to happen.</span>
                    <span className="role-flip-hint role-flip-hint-light">Click to turn back</span>
                  </span>
                </summary>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="rounded-[30px] border border-[#e7e1d3] bg-[#f2efe8] p-6 shadow-[0_14px_30px_rgba(23,23,21,0.04)] sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a21]">About us</p>
            <div className="hidden h-px flex-1 bg-[#d8d0c1] lg:block" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-[#171715] sm:text-5xl">
                We help creative teams move from planning to production without friction.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#585754]">
                Film Photo brings together studios, production support, and rental inventory in one workflow. We believe great creative work deserves a simpler way to book, manage, and deliver the right resources at the right time.
              </p>
            </div>

            <div className="floating-image-panel relative">
              <div className="absolute -left-6 top-6 h-28 w-28 rounded-full bg-[#d6a83f]/25 blur-3xl" />
              <div className="absolute -right-4 bottom-10 h-24 w-24 rounded-full bg-[#161615]/10 blur-3xl" />
              <div
                className="relative h-[320px] overflow-hidden rounded-[26px] border border-white/60 bg-cover bg-center shadow-[0_22px_50px_rgba(23,23,21,0.12)]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(21,21,20,0.08), rgba(21,21,20,0.42)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')",
                }}
              >
                <div className="absolute inset-x-6 bottom-6 rounded-[18px] border border-white/50 bg-white/80 p-4 backdrop-blur-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d6c3d]">Trusted by teams</div>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-3xl font-semibold tracking-[-0.06em] text-[#171715]">96%</div>
                      <div className="text-sm text-[#585754]">repeat booking rate</div>
                    </div>
                    <div className="rounded-full bg-[#f4e4b9] px-3 py-1 text-xs font-semibold text-[#171715]">+24% faster</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a21]">Everything you need</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#171715] sm:text-4xl">
            Built for creators, brands, and production teams.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={feature.title} className={`reveal reveal-delay-${index + 1} rounded-[24px] border border-[#e7e1d3] bg-white p-6 shadow-[0_12px_28px_rgba(23,23,21,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(23,23,21,0.08)]`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ebd5] text-2xl">{feature.icon}</div>
              <h3 className="mt-5 text-xl font-semibold text-[#171715]">{feature.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#585754]">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="bg-[#171715] py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b36b]">Popular categories</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Explore spaces that match your creative brief.
              </h2>
            </div>
            <Link href="/login" className="inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              View all places
            </Link>
          </div>

          <div className="marquee-shell mb-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <div className="marquee-track whitespace-nowrap">
              {[...categoryMarquee, ...categoryMarquee].map((item, index) => (
                <span key={`${item}-${index}`} className="marquee-item inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#f5ecdf]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {categories.map((category, index) => (
              <div key={category.name} className={`reveal reveal-delay-${index + 1} group overflow-hidden rounded-[24px] border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/20`}>
                <div
                  className="h-72 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${category.image}')` }}
                />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    <span className="text-sm text-[#d5c8a9]">12 spaces</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a21]">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#171715] sm:text-4xl">
            From discovery to delivery in three simple steps.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className={`reveal reveal-delay-${index + 1} rounded-[24px] border border-[#e7e1d3] bg-[#f9f7f3] p-6 transition duration-300 hover:-translate-y-1 hover:bg-[#fffefb]`}>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a6a21]">{step.number}</div>
              <h3 className="mt-4 text-2xl font-semibold text-[#171715]">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#585754]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="bg-[#f1eadb] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a21]">Why teams choose us</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#171715] sm:text-4xl">
              Trusted by growing creative businesses.
            </h2>
          </div>

          <div className="review-slider overflow-hidden rounded-[26px] border border-[#e6dfd1] bg-white/70 p-2 shadow-[0_12px_28px_rgba(23,23,21,0.04)]">
            <div className="review-track flex w-max gap-5">
              {[...testimonials, ...testimonials].map((item, index) => (
                <div key={`${item.author}-${index}`} className="w-[320px] rounded-[22px] border border-[#e6dfd1] bg-white p-6 shadow-[0_12px_28px_rgba(23,23,21,0.04)] sm:w-[420px]">
                  <div className="flex gap-1 text-[#d6a83f]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span key={`${item.author}-${starIndex}`}>★</span>
                    ))}
                  </div>
                  <p className="mt-5 text-lg leading-8 text-[#2b2a28]">“{item.quote}”</p>
                  <div className="mt-6 border-t border-[#efe8dc] pt-4">
                    <div className="font-semibold text-[#171715]">{item.author}</div>
                    <div className="text-sm text-[#666560]">{item.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="rounded-[30px] bg-[#171715] px-6 py-10 text-white shadow-[0_24px_55px_rgba(13,13,13,0.15)] sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b36b]">Ready to create?</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Launch your next creative project with Film Photo.
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex rounded-full bg-[#f4e4b9] px-6 py-3 text-sm font-semibold text-[#171715] transition hover:bg-[#f7efdb]">
                Create account
              </Link>
              <Link href="/login" className="inline-flex rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e7e1d3] bg-[#f7f7f2]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm text-[#5e5b54] sm:px-8 lg:grid-cols-[1.3fr_0.8fr_0.8fr] lg:px-10">
          <div>
            <div className="flex items-center gap-3 font-semibold tracking-[0.18em] text-[#171715]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d6a83f] bg-[#f8edd9] text-[10px]">FP</span>
              FILM PHOTO
            </div>
            <p className="mt-4 max-w-xs text-base leading-7 text-[#595752]">
              Premium spaces, equipment, and creative support for modern shoots and brand productions.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#171715]">Explore</h3>
            <ul className="mt-4 space-y-3 text-[#5b5a56]">
              <li><Link href="#features" className="transition hover:text-[#171715]">Features</Link></li>
              <li><Link href="#categories" className="transition hover:text-[#171715]">Categories</Link></li>
              <li><Link href="#reviews" className="transition hover:text-[#171715]">Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#171715]">Support</h3>
            <ul className="mt-4 space-y-3 text-[#5b5a56]">
              <li><Link href="/login" className="transition hover:text-[#171715]">Login</Link></li>
              <li><Link href="/register" className="transition hover:text-[#171715]">Create account</Link></li>
              <li><Link href="/forgot-password" className="transition hover:text-[#171715]">Forgot password</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e7e1d3]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-sm text-[#6b6963] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p>© 2026 Film Photo. All rights reserved.</p>
            <div className="flex flex-wrap gap-5">
              <Link href="#" className="transition hover:text-[#171715]">Privacy</Link>
              <Link href="#" className="transition hover:text-[#171715]">Terms</Link>
              <Link href="#" className="transition hover:text-[#171715]">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
