import { StyleSheet, View } from 'react-native';

import { Group, Row } from '@/components/group';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { RULES, computeStat, formatPercent, plural, recentMarks, type Stat } from '@/lib/attendance';
import { formatShort } from '@/lib/dates';
import { useAppState } from '@/lib/store';
import type { AppState, ClassType, Subject } from '@/lib/types';
import { colors, spacing } from '@/theme';

const TYPES: ClassType[] = ['theory', 'practical'];
const STRIP_LENGTH = 30;

const unit = (type: ClassType, n: number) => plural(n, type === 'theory' ? 'class' : 'practical');
const withHours = (type: ClassType, n: number) =>
  RULES[type].hours > 1 ? `${unit(type, n)} (${n * RULES[type].hours} hrs)` : unit(type, n);

export default function OverviewScreen() {
  const s = useAppState();
  const rows = s.subjects.flatMap((subject) =>
    TYPES.map((type) => ({ subject, type, stat: computeStat(s, subject.id, type) })),
  );

  return (
    <Page>
      <Finding rows={rows} />
      {s.subjects.map((subject) => (
        <Group key={subject.id} title={subject.name} swatch={subject.color}>
          {rows
            .filter((r) => r.subject.id === subject.id)
            .map(({ type, stat }) => (
              <StatRow key={type} s={s} subject={subject} type={type} stat={stat} />
            ))}
        </Group>
      ))}
    </Page>
  );
}

/** The one line that matters most: the biggest shortfall, or the tightest margin. */
function Finding({ rows }: { rows: { subject: Subject; type: ClassType; stat: Stat }[] }) {
  const counted = rows.filter((r) => r.stat.ok !== null);
  const short = counted.filter((r) => !r.stat.ok).sort((a, b) => b.stat.need - a.stat.need);
  const name = (r: (typeof rows)[number]) => `${r.subject.name} ${RULES[r.type].label.toLowerCase()}`;

  let headline: string;
  let color: string = colors.ink;
  let detail: string;
  if (counted.length === 0) {
    headline = 'Nothing marked yet';
    detail = 'Mark your classes on the Today tab and your percentages show up here.';
  } else if (short.length > 0) {
    const worst = short[0];
    headline = `${name(worst)} is ${withHours(worst.type, worst.stat.need)} short`;
    color = colors.short;
    detail =
      short.length === 1
        ? `The other ${counted.length - 1} are above the minimum.`
        : `${short.length} of ${counted.length} are below the minimum.`;
  } else {
    const tightest = [...counted].sort((a, b) => a.stat.canBunk - b.stat.canBunk)[0];
    headline = 'Everything is above the minimum';
    color = colors.good;
    detail =
      tightest.stat.canBunk === 0
        ? `${name(tightest)} has no room left to bunk.`
        : `Least room: ${name(tightest)}, ${unit(tightest.type, tightest.stat.canBunk)}.`;
  }

  return (
    <View style={{ gap: 2, paddingHorizontal: spacing.xs }}>
      <ThemedText variant="headline" style={{ color }}>
        {headline}
      </ThemedText>
      <ThemedText variant="footnote">
        {detail} Theory needs {RULES.theory.min}%, practical {RULES.practical.min}%.
      </ThemedText>
    </View>
  );
}

function StatRow({ s, subject, type, stat }: { s: AppState; subject: Subject; type: ClassType; stat: Stat }) {
  const rule = RULES[type];
  const verdict = stat.ok === null ? colors.tertiary : stat.ok ? colors.good : colors.short;

  return (
    <Row style={{ gap: spacing.sm, paddingVertical: spacing.md }}>
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="headline">{rule.label}</ThemedText>
          <ThemedText variant="footnote">
            {stat.held === 0
              ? 'No classes marked yet'
              : `${stat.attended} of ${unit(type, stat.held)} attended`}
          </ThemedText>
        </View>
        <ThemedText variant="figure" style={{ color: verdict }} selectable>
          {stat.percent === null ? '–' : formatPercent(stat.percent)}
        </ThemedText>
      </View>
      {stat.held > 0 ? <RegisterStrip marks={recentMarks(s, subject.id, type, STRIP_LENGTH)} total={stat.held} /> : null}
      {stat.ok === null ? null : <Advice type={type} stat={stat} />}
    </Row>
  );
}

/** One cell per marked class, like a row in the college register: filled = present, hollow = bunk. */
function RegisterStrip({ marks, total }: { marks: ('present' | 'bunk')[]; total: number }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.strip} accessibilityLabel={`Last ${marks.length} classes`}>
        {marks.map((m, i) => (
          <View key={i} style={[styles.cell, m === 'present' ? styles.present : styles.bunk]} />
        ))}
      </View>
      {total > marks.length ? <ThemedText variant="caption">Last {marks.length} classes</ThemedText> : null}
    </View>
  );
}

function Advice({ type, stat }: { type: ClassType; stat: Stat }) {
  const min = RULES[type].min;
  const p = stat.projection;
  let text: string;
  let color: string;

  if (!stat.ok) {
    color = colors.short;
    const next =
      stat.need === 1
        ? type === 'theory'
          ? 'class'
          : `practical (${RULES.practical.hours} hrs)`
        : withHours(type, stat.need);
    text = `Attend the next ${next} to get back to ${min}%.`;
    if (p) text += ` That's about ${plural(p.days, 'day')}, by ${formatShort(p.until!)}.`;
  } else if (stat.canBunk === 0) {
    color = colors.notice;
    text = `No room to bunk. Missing the next ${type === 'theory' ? 'class' : 'practical'} drops you below ${min}%.`;
  } else {
    color = colors.good;
    text = `You can bunk ${withHours(type, stat.canBunk)} and stay at ${min}% or above.`;
    if (p && p.days === 0) text += ' Less than one full day of this subject.';
    else if (p) text += ` That covers ${plural(p.days, 'full day')}, up to ${formatShort(p.until!)}.`;
  }

  return (
    <ThemedText variant="footnote" style={{ color }}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  cell: { width: 7, height: 16, borderRadius: 2 },
  present: { backgroundColor: colors.markPresent },
  bunk: { borderWidth: 1.5, borderColor: colors.short },
});
