'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Camera, 
  User, 
  Mail, 
  Lock, 
  Quote, 
  AlignLeft, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shapes,
  Gamepad2
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { updateUser, uploadProfilePhoto } from '@/lib/user/repository';
import { getCategories } from '@/lib/category/repository';
import { CategoryModel } from '@/lib/category/models';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import Image from 'next/image';
import { useT } from '@/lib/i18n/context';

export default function EditProfile() {
  const { user, firebaseUser, loading } = useAuthContext();
  const router = useRouter();
  const t = useT();
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteVerse, setFavoriteVerse] = useState('');
  const [favoriteCategoryId, setFavoriteCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  
  // Auth Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form and fetch categories
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setFavoriteVerse(user.favoriteVerse || '');
      setFavoriteCategoryId(user.favoriteCategoryId || '');
    }

    async function fetchCategories() {
      try {
        const cats = await getCategories(true);
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewURL(localPreview);

    try {
      setIsUploading(true);
      setMessage(null);

      // 1. Upload to Firebase Storage + update Firestore
      const downloadURL = await uploadProfilePhoto(firebaseUser.uid, file);

      // 2. Also update Firebase Auth profile so firebaseUser.photoURL is synced
      await updateProfile(firebaseUser, { photoURL: downloadURL });

      // 3. Keep the real URL as preview
      setPreviewURL(downloadURL);
      setMessage({ type: 'success', text: '¡Foto de perfil actualizada!' });
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      // Show the specific Firebase error if available
      const errMsg = err?.code === 'storage/unauthorized'
        ? 'Sin permisos para subir imágenes. Verifica las reglas de Firebase Storage.'
        : err?.message || 'Error al subir la imagen.';
      setPreviewURL(null);
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      setIsSaving(true);
      setMessage(null);

      // 1. Update basic info in Firestore
      await updateUser(firebaseUser.uid, {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim() || user.fullName,
        bio,
        favoriteVerse,
        favoriteCategoryId
      });

      // 2. Handle Password Update if requested
      if (newPassword) {
        if (!currentPassword) {
            setMessage({ type: 'error', text: 'Para cambiar la contraseña, debes ingresar la contraseña actual.' });
            setIsSaving(false);
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(firebaseUser.email!, currentPassword);
            await reauthenticateWithCredential(firebaseUser, credential);
            await updatePassword(firebaseUser, newPassword);
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error de autenticación. Verifica tu contraseña actual.' });
            setIsSaving(false);
            return;
        }
      }

      // 3. Handle Email Update if changed
      if (email !== firebaseUser.email) {
          // Note: Email change also requires reauth, we could use the same credential above
          try {
              await updateEmail(firebaseUser, email);
              await updateUser(firebaseUser.uid, { email });
          } catch (err: any) {
              console.error(err);
              setMessage({ type: 'error', text: 'Error al actualizar el correo electrónico.' });
              // We continue because name/bio were already saved
          }
      }

      setMessage({ type: 'success', text: 'Perfil actualizado con éxito.' });
      setTimeout(() => router.push('/profile'), 1500);
      
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#faf9fc] text-[#1b1b1e] min-h-screen pb-20 font-sans selection:bg-[#eddcff]">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-[#faf9fc]/70 backdrop-blur-xl">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#310065]/5 rounded-full transition-colors font-sans">
          <ChevronLeft className="text-[#310065] w-6 h-6" />
        </button>
        <h1 className="font-serif font-bold text-lg text-[#310065]">{t.profile.editProfile}</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-8">
        
        {/* Photo Section */}
        <section className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-[#e3e2e6]">
              <div className="relative w-full h-full">
                {(previewURL || user.photoURL) ? (
                  <Image 
                    src={previewURL || user.photoURL!} 
                    alt="Avatar" 
                    width={128} height={128}
                    className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-30' : 'opacity-100'}`}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#310065]/5">
                    <User className="w-16 h-16 text-[#310065]/20" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                    <Loader2 className="w-8 h-8 text-[#310065] animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#310065] text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all font-sans"
              disabled={isUploading}
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <p className="mt-4 text-xs font-bold text-[#4a4452] uppercase tracking-[0.15em]">{t.profile.displayName}</p>
        </section>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#310065] px-2">{t.auth.firstName}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.auth.firstName}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#310065]/40"><User className="w-4 h-4" /></span>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-[#1b1b1e]/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all font-sans text-sm font-bold"
                    placeholder={t.auth.placeholders.firstName}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.auth.lastName}</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-[#1b1b1e]/10 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all font-sans text-sm font-bold"
                  placeholder={t.auth.placeholders.lastName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.auth.email}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#310065]/40"><Mail className="w-4 h-4" /></span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#1b1b1e]/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all font-sans text-sm font-bold"
                  placeholder={t.auth.placeholders.email}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#310065] px-2">{t.profile.bio}</h3>
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.profile.bio}</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-[#310065]/40"><AlignLeft className="w-4 h-4" /></span>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-[#1b1b1e]/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all font-sans text-sm font-bold resize-none"
                  placeholder={t.profile.placeholders.bio}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.profile.stats}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#310065]/40"><Quote className="w-4 h-4" /></span>
                <input 
                  type="text" 
                  value={favoriteVerse}
                  onChange={(e) => setFavoriteVerse(e.target.value)}
                  className="w-full bg-white border border-[#1b1b1e]/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all font-sans text-sm font-bold italic"
                  placeholder={t.profile.placeholders.verse}
                />
              </div>
            </div>
          
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#310065] px-2">{t.profile.category}</h3>
            
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.profile.category}</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFavoriteCategoryId(cat.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                      favoriteCategoryId === cat.id 
                        ? 'bg-[#310065]/5 border-[#310065] scale-[1.02]' 
                        : 'bg-white border-[#1b1b1e]/10 hover:border-[#310065]/30'
                    }`}
                  >
                    {/* Fallback to Gamepad2 if icon not mapping well to lucide for now */}
                    <Gamepad2 className={`w-6 h-6 ${favoriteCategoryId === cat.id ? 'text-[#310065]' : 'text-[#310065]/40'}`} />
                    <span className={`text-xs font-bold ${favoriteCategoryId === cat.id ? 'text-[#310065]' : 'text-[#4a4452]'}`}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-serif text-lg font-bold text-[#310065]">{t.settings.security}</h3>
              <p className="text-[10px] font-bold text-[#ba1a1a] uppercase bg-[#ba1a1a]/5 px-2 py-0.5 rounded-full">Proteger</p>
            </div>
            
            {!showPasswordUpdate ? (
              <button
                type="button"
                onClick={() => setShowPasswordUpdate(true)}
                className="w-full py-3.5 bg-white border border-[#1b1b1e]/10 text-[#310065] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-[#310065]/5 hover:border-[#310065]/30 transition-all font-sans shadow-sm"
              >
                <Lock className="w-4 h-4" />
                {t.settings.changePassword}
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-white border border-[#1b1b1e]/10 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#4a4452] uppercase tracking-wider ml-2">{t.auth.password}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#310065]/40"><Lock className="w-4 h-4" /></span>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#faf9fc] border border-[#1b1b1e]/10 rounded-2xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-[#310065]/10 focus:border-[#310065] transition-all font-sans text-sm font-bold"
                      placeholder={t.profile.placeholders.minChars}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a4452] hover:text-[#310065] font-sans"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[11px] font-black text-[#ba1a1a] uppercase tracking-wider ml-2 opacity-80">Contraseña Actual (Requerida)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ba1a1a]/40"><Lock className="w-4 h-4" /></span>
                      <input 
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#ba1a1a]/5 border border-[#ba1a1a]/10 rounded-2xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a] transition-all font-sans text-sm font-bold"
                        placeholder={t.profile.placeholders.currentPassword}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ba1a1a]/60 hover:text-[#ba1a1a] font-sans"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordUpdate(false);
                    setNewPassword('');
                    setCurrentPassword('');
                  }}
                  className="w-full py-2.5 mt-2 text-[#4a4452] font-black text-[11px] uppercase tracking-widest rounded-xl flex items-center justify-center hover:bg-[#1b1b1e]/5 transition-colors font-sans"
                >
                  Cancelar Cambio
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full py-4 bg-[#310065] text-white font-black text-[14px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-[#4a148c] transition-all active:scale-[0.98] shadow-lg shadow-[#310065]/10 disabled:opacity-50 disabled:active:scale-100 font-sans"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? t.profile.saving : t.profile.save}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="w-full py-4 text-[#4a4452] font-black text-[12px] uppercase tracking-widest rounded-2xl flex items-center justify-center hover:bg-[#310065]/5 transition-colors font-sans"
            >
              {t.common.cancel}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
