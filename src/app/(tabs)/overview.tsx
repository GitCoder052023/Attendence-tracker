import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, Dot, Screen } from '@/components/ui';
import { radius, useTheme } from '@/constants/theme';
import { RULES, computeStat, formatPercent, plural, type Stat } from '@/lib/attendance';
import { formatShort } from '@/lib/dates';
import { useAppState } from '@/lib/store';
import type { ClassType } from '@/lib/types';

const TYPES: ClassType[] = ['theory', 'practical'];

export default function OverviewScreen() {
  const s = useAppState();
  const c = useTheme();

  const rows = s.subjects.map((subject) => ({
    subject,
    stats: TYPES.map((type) => ({ type, stat: computeStat(s, subject.id, type) })),
  }));
  const counted = rows.flatMap((r) => r.stats).filter((x) => x.stat.ok !== null);
  const behind = counted.filter((x) => !x.stat.ok).length;

  return (
    <Screen title="Attendance" subtitle="Theory 75% · Practical 80% minimum">
      {counted.length > 0 ? (
        <Card
          style={{
            backgroundColor: behind ? c.redSoft : c.greenSoft,
            borderColor: 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Icon name={behind ? 'warning' : 'shield'} size={26} color={behind ? c.red : c.green} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.summaryTitle, { color: behind ? c.red : c.green }]}>
              {behind ? `${behind} below the minimum` : 'All above the minimum'}
            </Text>
            <Text style={[styles.small, { color: c.text }]}>
              {counted.length - behind} of {counted.length} on track
            </Text>
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={[styles.small, { color: c.muted }]}>
            Mark your classes on the Today tab and your attendance shows up here.
          </Text>
        </Card>
      )}

      {rows.map(({ subject, stats }) => (
        <Card key={subject.id} style={{ gap: 18 }}>
          <View style={styles.inline}>
            <Dot color={subject.color} size={12} />
            <Text style={[styles.subject, { color: c.text }]}>{subject.name}</Text>
          </View>
          {stats.map(({ type, stat }) => (
            <StatBlock key={type} type={type} stat={stat} />
          ))}
        </Card>
      ))}
    </Screen>
  );
}

function StatBlock({ type, stat }: { type: ClassType; stat: Stat }) {
  const c = useTheme();
  const rule = RULES[type];
  const tone = stat.ok === null ? c.faint : stat.ok ? c.green : c.red;
  const unit = (n: number) => plural(n, type === 'theory' ? 'class' : 'practical');
  const hours = (n: number) => plural(n * rule.hours, 'hr');

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.rowBetween}>
        <View style={{ gap: 2 }}>
          <Text style={[styles.typeLabel, { color: c.muted }]}>
            {rule.label.toUpperCase()} · MIN {rule.min}%
          </Text>
          <Text style={[styles.small, { color: c.muted }]}>
            {stat.held === 0
              ? 'No classes marked yet'
              : `${stat.attended} of ${unit(stat.held)}${
                  rule.hours > 1 ? ` · ${stat.attended * rule.hours}/${hours(stat.held)}` : ''
                }`}
          </Text>
        </View>
        <Text style={[styles.percent, { color: tone }]}>
          {stat.percent === null ? '—' : formatPercent(stat.percent)}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: c.track }]}>
        <View
          style={[styles.fill, { width: `${stat.percent ?? 0}%`, backgroundColor: tone }]}
        />
        <View style={[styles.marker, { left: `${rule.min}%`, backgroundColor: c.text }]} />
      </View>

      {stat.ok === null ? null : <Advice type={type} stat={stat} unit={unit} hours={hours} />}
    </View>
  );
}

function Advice({
  type,
  stat,
  unit,
  hours,
}: {
  type: ClassType;
  stat: Stat;
  unit: (n: number) => string;
  hours: (n: number) => string;
}) {
  const c = useTheme();
  const rule = RULES[type];
  const p = stat.projection;
  const withHours = (n: number) => (rule.hours > 1 ? `${unit(n)} (${hours(n)})` : unit(n));

  let fg: string, bg: string, title: string, detail: string | null;
  if (!stat.ok) {
    fg = c.red;
    bg = c.redSoft;
    title = `Behind by ${withHours(stat.need)}`;
    detail = p
      ? `Attend the next ${unit(stat.need)} to reach ${rule.min}% — about ${plural(p.days, 'day')}, by ${formatShort(p.until!)}.`
      : `Attend the next ${unit(stat.need)} in a row to reach ${rule.min}%.`;
  } else if (stat.canBunk === 0) {
    fg = c.amber;
    bg = c.amberSoft;
    title = 'No margin left';
    detail = `Bunking the next ${type === 'theory' ? 'class' : 'practical'} takes you below ${rule.min}%.`;
  } else {
    fg = c.green;
    bg = c.greenSoft;
    title = `Margin of ${withHours(stat.canBunk)}`;
    detail = !p
      ? `You can bunk ${unit(stat.canBunk)} and stay at ${rule.min}% or above.`
      : p.days === 0
        ? `You can bunk ${unit(stat.canBunk)} — less than one full day of this subject.`
        : `You can bunk ${unit(stat.canBunk)} — that's ${plural(p.days, 'full day')}, up to ${formatShort(p.until!)}.`;
  }

  return (
    <View style={[styles.advice, { backgroundColor: bg }]}>
      <Text style={[styles.adviceTitle, { color: fg }]}>{title}</Text>
      <Text style={[styles.adviceText, { color: c.text }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  summaryTitle: { fontSize: 17, fontWeight: '700' },
  subject: { fontSize: 19, fontWeight: '700' },
  typeLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  small: { fontSize: 13, fontWeight: '500' },
  percent: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, opacity: 0.35 },
  advice: { borderRadius: radius.md, padding: 12, gap: 2, borderCurve: 'continuous' },
  adviceTitle: { fontSize: 14, fontWeight: '700' },
  adviceText: { fontSize: 13, lineHeight: 18 },
});
