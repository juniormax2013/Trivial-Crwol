import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const tournamentData = {
      title: "Gran Torneo de Prueba",
      subtitle: "Torneo generado automáticamente",
      type: "season",
      difficulty: "medium",
      status: "active",
      rewardConfig: {
        crowns: 500,
        xp: 1000,
        coins: 200,
        badge: "champion"
      },
      maxParticipants: 100,
      currentParticipants: 0,
      registrationStartsAt: new Date(Date.now() - 86400000).toISOString(),
      registrationEndsAt: new Date(Date.now() + 86400000).toISOString(),
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      endsAt: new Date(Date.now() + 172800000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "tournaments"), tournamentData);
    
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
