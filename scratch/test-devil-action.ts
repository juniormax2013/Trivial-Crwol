import { getDevilActionFromGameEvent, GameEvent } from '../hooks/useDevilAction';

const testCases = [
  { event: 'user_answer_wrong', expected: 'risa_malvada' },
  { event: 'user_lost_game', expected: 'victoria' },
  { event: 'user_won_game', expected: 'derrota' },
  { event: 'devil_power_activated', expected: 'ataque' },
  { event: 'user_two_correct_answers', expected: 'sorprendido' },
  { event: 'app_loading', expected: 'pensando' },
  { event: 'user_correct_streak', expected: 'enojo' },
  { event: 'devil_enter_screen', expected: 'aparecer_humo' },
  { event: 'devil_exit_screen', expected: 'desaparecer_humo' },
  { event: 'default_state', expected: 'idle' },
  { event: 'unknown_event_fallback', expected: 'idle' }
];

console.log('🧪 Probando getDevilActionFromGameEvent en TypeScript...');
let passes = 0;

for (const { event, expected } of testCases) {
  const actual = getDevilActionFromGameEvent(event as GameEvent);
  if (actual === expected) {
    console.log(`✅ [PASS] Evento: "${event}" -> "${actual}"`);
    passes++;
  } else {
    console.error(`❌ [FAIL] Evento: "${event}" -> Esperado: "${expected}", Obtenido: "${actual}"`);
  }
}

console.log(`\n📊 Resultados: ${passes}/${testCases.length} pruebas pasadas.`);
if (passes === testCases.length) {
  console.log('🎉 ¡Todas las pruebas de mapeo pasaron perfectamente!');
} else {
  throw new Error(`${testCases.length - passes} prueba(s) fallaron.`);
}
