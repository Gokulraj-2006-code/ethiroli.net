import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import SEO from "../shared/SEO";

/* ── Tiny helpers ─────────────────────────────────────────── */
function Icon({ name, className = "", style = {} }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

function StarRow() {
  return (
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name="star"
          className="star-icon"
          style={{ fontVariationSettings: "'FILL' 1" }}
        />
      ))}
    </div>
  );
}

function AnimatedNumber({ value, suffix = "" }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    const numericValue = Number(String(value).replace(/[^0-9.]/g, ""));
    const controls = animate(count, numericValue, { duration: 2, ease: "easeOut" });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const heroText = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/* ── Main component ───────────────────────────────────────── */
export default function EthiroliSeminar() {
  return (
    <>
      {/* Google Fonts */}
      {/* <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      /> */}

      <div className="page-root">
        <SEO
          title="Digital Marketing Seminar (Jayarani College) — Case Study | Ethiroli"
          description="Case study of Ethiroli's seminar at Jayarani Arts & Science College for Women empowering students with branding, social media marketing, and digital career roadmaps."
          canonical="https://ethiroli.net/projects/Ethiroliseminarjayarani"
          keywords="jayarani seminar, college digital marketing seminar, ethiroli case study, branding guidance, women empowerment"
        />

        {/* ── HERO ─────────────────────────────────────────── */}
        <motion.section
          className="hero"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <div className="hero__bg">
            <img
              src="/assets/images/projects/seminar-empowering-students.jpg"
              alt="Students attending an empowering seminar"
              className="hero__img"
            />
            <div className="hero__overlay" />
          </div>

          <div className="container hero__content">
            <motion.div className="hero__text" variants={heroText} transition={{ duration: 0.8, ease: "easeOut" }}>
              <h1 className="hero__heading">
                Empowering Students Through{" "}
                <span className="hero__heading-accent">SMM</span>
              </h1>
              <p className="hero__sub">
                A collaborative initiative by Ethiroli and Jaya Rani College to bridge the gap
                between traditional education and high-demand digital skills.
              </p>
              <div className="hero__cta-row">
                <button className="btn btn--container">View Highlights</button>
                <button className="btn btn--glass">Explore Seminar</button>
              </div>
            </motion.div>

            <motion.div className="hero__cards" variants={stagger}>
              <motion.div className="glass-card hero__card hero__card--shifted-left" variants={fadeUp} transition={{ duration: 0.7 }}>
                <Icon name="group" className="hero__card-icon hero__card-icon--primary" style={{ fontSize: 32 }} />
                <h3 className="hero__card-title">150+ Students</h3>
                <p className="hero__card-sub">Actively Participating</p>
              </motion.div>
              <motion.div className="glass-card hero__card" variants={fadeUp} transition={{ duration: 0.7, delay: 0.08 }}>
                <Icon name="trending_up" className="hero__card-icon hero__card-icon--secondary" style={{ fontSize: 32 }} />
                <h3 className="hero__card-title">Career Guidance</h3>
                <p className="hero__card-sub">Future-ready Insights</p>
              </motion.div>
              <motion.div className="glass-card hero__card hero__card--shifted-mid" variants={fadeUp} transition={{ duration: 0.7, delay: 0.16 }}>
                <Icon name="school" className="hero__card-icon hero__card-icon--tertiary" style={{ fontSize: 32 }} />
                <h3 className="hero__card-title">Expert Mentors</h3>
                <p className="hero__card-sub">Industry Professionals</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* ── ABOUT ────────────────────────────────────────── */}
        <motion.section className="about section" id="about" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
          <div className="container about__grid">
            <motion.div className="about__img-wrap" variants={fadeUp} transition={{ duration: 0.7 }}>
              <div className="about__circle">
                <img
                  src="/assets/images/projects/seminar-empowering-students.jpg"
                  alt="Students at the Jayarani College seminar"
                  className="about__circle-img"
                />
              </div>
              <div className="about__thumb">
                <img
                  src="/assets/images/projects/career-team.jpg"
                  alt="Students collaborating on a digital project"
                  className="about__thumb-img"
                />
              </div>
            </motion.div>

            <motion.div className="about__body" variants={fadeUp} transition={{ duration: 0.7, delay: 0.08 }}>
              <span className="label-tag label-tag--tertiary">Foundations</span>
              <h2 className="about__heading">
                Bridging Education &amp; <span className="text--secondary">Digital Skills</span>
              </h2>
              <p className="about__para">
                This seminar is meticulously crafted to empower the next generation of marketing
                professionals at Jaya Rani College. We combine academic excellence with the
                practical realities of the modern digital landscape.
              </p>
              <blockquote className="about__quote">
                "Our mission is to ensure every student walks away with not just knowledge, but a
                roadmap for their professional future in the digital economy."
              </blockquote>
            </motion.div>
          </div>
        </motion.section>

        {/* ── TOPICS ───────────────────────────────────────── */}
        <motion.section className="topics section section--dark" id="topics" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-header__title text--on-dark">Mastering the Digital Realm</h2>
              <p className="section-header__sub text--tertiary-dim">Core modules designed for strategic impact.</p>
            </div>

            <div className="topics__grid">
              <motion.div className="topic-card topic-card--wide glass-dark" variants={fadeUp} transition={{ duration: 0.55 }}>
                <div className="topic-card__icon-wrap topic-card__icon-wrap--primary">
                  <Icon name="ads_click" className="text--on-primary" />
                </div>
                <h3 className="topic-card__title">Instagram Marketing</h3>
                <p className="topic-card__desc">
                  Advanced strategies for growth, algorithm optimization, and high-impact visual
                  storytelling for brand success.
                </p>
              </motion.div>

              <motion.div className="topic-card glass-dark" variants={fadeUp} transition={{ duration: 0.55, delay: 0.06 }}>
                <div className="topic-card__icon-wrap topic-card__icon-wrap--primary">
                  <Icon name="person_celebrate" className="text--on-primary" />
                </div>
                <h3 className="topic-card__title">Personal Branding</h3>
                <p className="topic-card__desc">
                  Developing a unique professional identity that resonates in the global job market.
                </p>
              </motion.div>

              <motion.div className="topic-card glass-dark" variants={fadeUp} transition={{ duration: 0.55, delay: 0.12 }}>
                <div className="topic-card__icon-wrap topic-card__icon-wrap--primary">
                  <Icon name="movie_edit" className="text--on-primary" />
                </div>
                <h3 className="topic-card__title">Content Creation</h3>
                <p className="topic-card__desc">
                  From concept to viral execution using modern mobile tools.
                </p>
              </motion.div>

              {/* <div className="topic-card topic-card--full topic-card--row glass-dark">
                <div className="topic-card__body">
                  <div className="topic-card__icon-wrap topic-card__icon-wrap--secondary">
                    <Icon name="work_history" className="text--on-secondary" />
                  </div>
                  <h3 className="topic-card__title">Career Opportunities</h3>
                  <p className="topic-card__desc">
                    Navigating the digital job landscape, freelance markets, and high-paying agency roles.
                  </p>
                </div>
                <div className="topic-card__action">
                  <button className="btn btn--pill">Download Syllabus</button>
                </div>
              </div> */}
            </div>
          </div>
        </motion.section>

        {/* ── STATS ────────────────────────────────────────── */}
        <motion.section className="stats section" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
          <div className="stats__blob stats__blob--tl" />
          <div className="stats__blob stats__blob--br" />
          <div className="container stats__row">
            {[
              { val: "150+", cls: "stats__val--secondary", label: "Participants" },
              { val: "4+",   cls: "stats__val--primary",   label: "Key Topics" },
              { val: "10+",  cls: "stats__val--tertiary",  label: "Live Projects" },
              { val: "100%", cls: "stats__val--clay",      label: "Practical" },
            ].map(({ val, cls, label }) => (
              <motion.div key={label} className="stats__item" variants={fadeUp} transition={{ duration: 0.55 }}>
                <div className={`stats__val ${cls}`}>
                  <AnimatedNumber
                    value={val}
                    suffix={String(val).includes("+") ? "+" : String(val).includes("%") ? "%" : ""}
                  />
                </div>
                <p className="stats__label">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── TIMELINE ─────────────────────────────────────── */}
        {/* <section className="timeline-sec section section--dark" id="timeline">
          <div className="timeline-container">
            <div className="section-header">
              <h2 className="section-header__title text--on-dark">Seminar Journey</h2>
              <p className="section-header__sub text--tertiary-dim">The strategic roadmap for the day.</p>
            </div>

            <div className="timeline">
              <div className="timeline__line" />
              {[
                { time: "09:30 AM", title: "Welcome Session", desc: "Opening remarks by Jaya Rani College and Ethiroli leadership team." },
                { time: "10:15 AM", title: "Intro to SMM",     desc: "Understanding the architecture of social ecosystems and user psychology." },
                { time: "11:45 AM", title: "Marketing Strategies", desc: "Deep dive into organic growth and paid performance frameworks." },
                { time: "02:00 PM", title: "Student Interaction", desc: "Interactive Q&A and live content creation workshop." },
              ].map(({ time, title, desc }, i) => (
                <div key={time} className={`timeline__item ${i % 2 === 0 ? "timeline__item--right" : "timeline__item--left"}`}>
                  <div className="timeline__spacer" />
                  <div className="timeline__dot" />
                  <div className="timeline__panel-wrap">
                    <div className="glass-card timeline__panel">
                      <span className="timeline__time">{time}</span>
                      <h4 className="timeline__title">{title}</h4>
                      <p className="timeline__desc">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── ETHIROLI SUPPORT ─────────────────────────────── */}
        <motion.section className="support section" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
          <div className="container support__flex">
            <motion.div className="support__img-col" variants={fadeUp} transition={{ duration: 0.7 }}>
              <div className="support__img-wrap">
                <img
                  src="/assets/images/founder/WhatsApp Image 2026-03-16 at 2.11.29 PM.jpeg"
                  alt="Speaker"
                  className="support__img"
                />
              </div>
            </motion.div>
            <motion.div className="support__body-col" variants={fadeUp} transition={{ duration: 0.7, delay: 0.08 }}>
              <div className="support__card">
                <span className="label-tag label-tag--primary">Our Commitment</span>
                <h2 className="support__heading">
                  Driven by Innovation, Powered by{" "}
                  <span className="text--primary">Ethiroli</span>
                </h2>
                <p className="support__para">
                  Ethiroli is dedicated to creating a ripple effect of digital knowledge across
                  educational institutions. We believe that empowering students with marketing skills
                  is the first step toward a digitally-inclusive economy.
                </p>
                <button className="btn btn--sec-container support__btn" onClick={() => window.location.href = "/about"}>
                  Learn More About Ethiroli
                  <Icon name="arrow_forward" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ── GALLERY ──────────────────────────────────────── */}
        <motion.section className="gallery-sec section" id="gallery" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-header__title">Seminar Highlights</h2>
              <p className="section-header__sub">Moments captured at Jaya Rani College.</p>
            </div>
            <div className="masonry-grid">
              {[
                { src: "/assets/images/projects/digital-workshop.jpg", caption: "Collaborative Sessions" },
                { src: "/assets/images/projects/seminar-empowering-students.jpg", caption: "Full House Participation" },
                { src: "/assets/images/projects/career-team.jpg", caption: "Student Presentations" },
                { src: "/assets/images/projects/webinar-digital-marketing.jpg", caption: "Awards & Certificates" },
              ].map(({ src, caption }) => (
                <motion.div key={caption} className="masonry-item gallery-item" variants={fadeUp} transition={{ duration: 0.55 }}>
                  <img src={src} alt={caption} className="gallery-item__img" />
                  <div className="gallery-item__overlay">
                    <p className="gallery-item__caption">{caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── TESTIMONIALS ─────────────────────────────────── */}
        <motion.section className="testimonials section" id="testimonials" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-header__title">Student Voices</h2>
              <p className="section-header__sub">The impact through their eyes.</p>
            </div>
            <div className="testimonials__grid">
              {[
                { quote: "The Instagram marketing module changed how I view social media. It's not just about posting; it's about strategy. Ethiroli made it so easy to understand.", name: "Priya S.", role: "B.Com Student", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPgiWcLvGYzG_mO1nhLFMZqU7kod1yrGMo6dhYVohA4cRBrJZMbkX4HhWXSn3chEuz6NiKW-c2LPep1Sdw4fd4z8r_kDvazc75DAi08uMEy_gtWCG5u4bM0CHavaKhOTBvaZ_J6b7ccA8v8Yfxf9rjVKg0vz3_OQhPEmJ49wafIzvrywoqJhLzE4oEghAGKl_tUgMajHv_cilD6iqgkMf7UMcl5sp6yOXNIaqh8P7gXq6cY9eXFe_AzMIBUONb5y8yBD-0GfI5KOSW" },
                { quote: "I never thought personal branding was so important. This seminar gave me the confidence to build my own professional presence online.", name: "Rahul K.", role: "BBA Student", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuACwLu9-_L1IE01N9p_Izyk0yL7wb24PGIYSvzBYicc6IBA3oIPbxnElnSLCDej4onSahwbMqTQEkoZDSDJk0f1eRZNpuHjT0qGhuiFNeq0os7eTyJypwGeuUdu5ciKkZ4bfroUl53DBLMese3HppP_ZvuDAi4hEaM6Smjj0_VnumjxkG-6C58XaJEOtJO6sfAvUlxiNcqBqOm5vc2_IvZlz9eD_BPDu5CV6TTGxVv84psZmenLvj_LJB_JcfZst6LW-B_aNxKdgCqc" },
                { quote: "The session on career opportunities was eye-opening. Now I know exactly where to start my digital marketing journey after college.", name: "Ananya V.", role: "Final Year Student", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAARbEeDkAxMZNxpneVLWg_fLguEvUt0myabvMFOkFt1YwCw-yd9qH9NeGYvx2tgjJvXxThjgWFoAgzQrnsMhoAwYBxPsjMSXbsoUzoJdK8FQnoR8T4go16290xwFsHwD5KcGOitO6IqbHD1jhtXJ5M-9qLbJUJqytBguJuXB-CxKjM80b1LTHt31FFnDxibcoIues_2fp_oO9TKqE9bsDHsd-yFyFaDs4A31-baVLomhLsfK-nKRLBPXWBuPiO-D-qhuxrnFfWfxq_" },
              ].map(({ quote, name, role, avatar }) => (
                <motion.div key={name} className="testimonial-card" variants={fadeUp} transition={{ duration: 0.55 }}>
                  <StarRow />
                  <p className="testimonial-card__quote">"{quote}"</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      <img src={avatar} alt={name} />
                    </div>
                    <div>
                      <h4 className="testimonial-card__name">{name}</h4>
                      <p className="testimonial-card__role">{role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── FINAL CTA ────────────────────────────────────── */}
        <motion.section className="cta section section--dark section--gradient-tri" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={stagger}>
          <div className="cta__glow" />
          <motion.div className="cta__inner" variants={fadeUp} transition={{ duration: 0.7 }}>
            <h2 className="cta__heading text--on-dark">Creating Future Digital Leaders</h2>
            <p className="cta__sub text--tertiary-dim">
              Join our movement to modernize education and empower students with the tools they need
              to succeed in the digital-first economy.
            </p>
            <div className="cta__actions">
              <button className="btn btn--container">Partner With Ethiroli</button>
              <button className="btn btn--glass btn--bordered">Invite For Seminar</button>
            </div>
          </motion.div>
        </motion.section>

      </div>
    </>
  );
}
