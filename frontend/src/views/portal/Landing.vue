<template>
  <div class="landing">
    <div class="landing-inner">
      <header class="landing-top">
        <div class="landing-brand">
          <div class="landing-brand-text"><strong>{{ t('brandName') }}</strong><small>{{ t('brandTag') }}</small></div>
          <div class="landing-mark"><Logo :size="26" /></div>
        </div>
        <nav class="landing-nav">
          <button class="btn btn-solid" @click="$router.push({ name: 'dashboard' })">{{ t('navEnterWorkspace') }}</button>
        </nav>
      </header>
      <section class="landing-hero">
        <div class="landing-copy">
          <div class="landing-kicker">{{ t('landingKicker') }}</div>
          <h1>{{ t('landingH1a') }}<br />{{ t('landingH1b') }} <em>{{ t('landingH1em') }}</em></h1>
          <p class="landing-lede">{{ t('landingLede') }}</p>
          <div class="landing-trust"><Icon name="lock" :size="14" /> {{ t('landingTrust') }}</div>
        </div>
        <div class="landing-visual">
          <div class="landing-ring"></div>
          <div class="float-card float-card-main">
            <h4>أهلًا بيكم في عائلة أوان 🤍</h4>
            <div class="float-row"><span>🔒 خصوصيتكم</span><b>مسؤوليتنا الأولى دايمًا</b></div>
            <div class="float-row"><span>🤝 فريقكم المختص</span><b>معاكم خطوة بخطوة</b></div>
            <div class="float-row"><span>💛 كل تفصيلة عن طفلكم</span><b>محفوظة وآمنة تمامًا</b></div>
          </div>
          <div class="float-card float-card-mini">
            <span class="pill pill-good">ثقتكم غالية علينا</span>
            <b>خصوصية تامة</b>
            <small>بياناتكم وبيانات أسرتكم لا تُشارك مع أي جهة</small>
            <div class="big-pct">🤍</div>
          </div>
        </div>
      </section>
      <section class="section-grid-2" style="margin: 6px 0 34px">
        <div class="section-card" style="cursor: pointer; text-align: center" @click="$router.push('/family')">
          <span class="section-icon" style="margin: 0 auto 10px"><Icon name="team" :size="28" /></span>
          <h3 style="font-size: 16px">بوابة الأسرة</h3>
          <p>متابعة طفلك، حجز الجلسات، الباقات، والتأمين والدفع — كل شيء في مكان واحد وبخصوصية تامة.</p>
          <button class="btn btn-primary" style="width: 100%">فتح بوابة الأسرة</button>
        </div>
        <div class="section-card" style="cursor: pointer; text-align: center" @click="$router.push('/facility')">
          <span class="section-icon" style="margin: 0 auto 10px"><Icon name="briefcase" :size="28" /></span>
          <h3 style="font-size: 16px">ابدأ يومك في أوان</h3>
          <p>مركز، عيادة، مستشفى أو مدرسة — ادخل بكود مؤسستك وشاهد خدماتك.</p>
          <button class="btn btn-primary" style="width: 100%">ابدأ الآن</button>
        </div>
      </section>
      <section class="landing-features">
        <div class="landing-feature"><i><Icon name="schedule" :size="16" /></i>{{ t('landingFeature1') }}</div>
        <div class="landing-feature"><i><Icon name="heart" :size="16" /></i>{{ t('landingFeature2') }}</div>
        <div class="landing-feature"><i><Icon name="team" :size="16" /></i>{{ t('landingFeature3') }}</div>
        <div class="landing-feature"><i><Icon name="check" :size="16" /></i>{{ t('landingFeature4') }}</div>
      </section>
      <footer class="landing-footer">
        <div>{{ state.center.name }} · {{ state.center.city }}</div>
        <div class="landing-footer-contact">
          <a :href="`tel:${state.center.phone}`"><Icon name="idcard" :size="14" /> {{ state.center.phone }}</a>
          <a :href="`mailto:${state.center.email}`"><Icon name="bell" :size="14" /> {{ state.center.email }}</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import Logo from '@/components/Logo.vue'
import { state } from '@/store'
import { t } from '@/utils'
</script>
