import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231f2937'/><circle cx='50' cy='35' r='20' fill='%239ca3af'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%239ca3af'/></svg>";

interface SubItem {
  id: string;
  name: string;
  price: number;
  nextPayment: string;
  isVacationMode: boolean;
  isSmartSwapping: boolean;
  typeClass: string;
  logoLetter: string;
  usernameField: string;
  passwordField: string;
}

interface CatalogOffer {
  name: string;
  price: number;
  typeClass: string;
  logoLetter: string;
}

export default function Dashboard() {
  // --- States ---
  const [balance, setBalance] = useState<number>(0); // Solde commence à 0
  const [budgetLimit, setBudgetLimit] = useState<number>(25000);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'concierge' | 'exchange'>('dashboard');

  // User Premium States
  const [isUserPremium, setIsUserPremium] = useState<boolean>(false);
  const [premiumActiveTab, setPremiumActiveTab] = useState<'gratuit' | 'premium'>('gratuit');

  // Ghost Subscription States
  const [ghostChecked, setGhostChecked] = useState<{ [key: string]: boolean }>({
    netflix: false,
    spotify: false,
    canal: false,
    disney: false
  });
  const [ghostDetectedMessage, setGhostDetectedMessage] = useState<string>('');

  // Toast System and Logout Countdown States
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sidebar Expansion State
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);

  // User info loaded from localStorage
  const [userInfo, setUserInfo] = useState({
    name: 'Client Onyx',
    email: 'client@onyx.sn',
    phone: '77 000 00 00',
    isPremium: false
  });

  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [prefSms, setPrefSms] = useState<boolean>(true);
  const [prefWhatsapp, setPrefWhatsapp] = useState<boolean>(true);
  const [prefEmail, setPrefEmail] = useState<boolean>(false);
  const [userCountry, setUserCountry] = useState<string>('Sénégal');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');

  // --- Merged Concierge & Portfolio States ---
  interface RequestItem {
    id: string;
    type: string;
    service: string;
    status: string;
    slaHoursRemaining: number;
  }
  interface AlertItem {
    id: string;
    title: string;
    message: string;
    time: string;
  }
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'req-1',
      type: 'Smart Swapping',
      service: 'Netflix ⇆ Spotify',
      status: 'SLA 24h',
      slaHoursRemaining: 20
    }
  ]);
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-1',
      title: "Message d'Amadou pour le Profil Smart Swapping 3",
      message: 'SLA 24h',
      time: 'Il y a 4 heures'
    },
    {
      id: 'alert-2',
      title: "Message d'Amadou pour le Profil Smart Swapping 3",
      message: 'SLA 24h (Délai dépassé)',
      time: 'Il y a 6 heures'
    }
  ]);
  const [isOfferPremium, setIsOfferPremium] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [transactions, setTransactions] = useState([
    { id: 't-1', type: 'recharge', method: 'Wave', amount: 15000, date: "Aujourd'hui, 14:32", status: 'completed' },
    { id: 't-2', type: 'debit', label: 'Débit Netflix Premium', amount: -6500, date: 'Hier, 08:00', status: 'completed' },
    { id: 't-3', type: 'transfert', sender: 'Mamadou', amount: 5000, date: '27 Juin 2026', status: 'completed' },
    { id: 't-4', type: 'debit', label: 'Débit Spotify Duo', amount: -4900, date: '25 Juin 2026', status: 'completed' },
  ]);
  const [deviseInput, setDeviseInput] = useState<string>('10');
  const [deviseType, setDeviseType] = useState<'EUR' | 'USD'>('EUR');
  const [splitService, setSplitService] = useState<string>('Netflix');
  const [splitCustomPrice, setSplitCustomPrice] = useState<string>('6500');
  const [splitCount, setSplitCount] = useState<number>(3);
  const [splitFriends, setSplitFriends] = useState([
    { name: 'Amadou', status: 'pending' },
    { name: 'Fatou', status: 'completed' },
  ]);

  // --- Merged Exchange States ---
  interface ListingItem {
    id: string;
    offeringUser: string;
    offeredSub: string;
    wantedSub: string;
    status: 'available' | 'completed';
    createdAt: string;
    logo?: string;
    cost?: string;
    trustScore?: number;
    profileType?: string;
    service?: string;
  }
  const [notationHistory, setNotationHistory] = useState([
    { id: 'n-1', change: 5, reason: 'Échange réussi sans incident (Netflix)', date: 'Hier' },
    { id: 'n-2', change: 5, reason: 'Échange réussi sans incident (Spotify)', date: '25 Juin 2026' },
    { id: 'n-3', change: -30, reason: "Signalement d'accès bloqué (Canal+)", date: '18 Juin 2026' },
    { id: 'n-4', change: 10, reason: 'Comportement exemplaire de co-abonné', date: '12 Juin 2026' },
  ]);
  const [exchangeActiveTab, setExchangeActiveTab] = useState<string>('All');
  const [proposeAccessDetails, setProposeAccessDetails] = useState<string>('');
  const [proposeScreens, setProposeScreens] = useState<number>(1);
  const [proposeStorePayout, setProposeStorePayout] = useState<boolean>(true);
  const [proposeCost, setProposeCost] = useState<string>('1500');
  const [isLitigeOpen, setIsLitigeOpen] = useState<boolean>(false);
  const [litigeTarget, setLitigeTarget] = useState<any>(null);
  const [myJoinedSubs, setMyJoinedSubs] = useState([
    { id: 'js-1', service: 'Netflix', owner: 'Amadou', profileType: 'Profil 4K - Écran Éco', cost: '1 500 FCFA / mois', status: 'active' },
    { id: 'js-2', service: 'Spotify', owner: 'Mariama', profileType: 'Premium Famille - Compte Perso', cost: 'Échange Direct', status: 'active' },
  ]);
  const [pastExchanges, setPastExchanges] = useState([
    { id: 'pe-1', partnerName: 'Amadou', serviceLogo: '🎥', serviceName: 'Netflix Premium', date: '15 Juin 2026', status: 'active', phone: '+221770000001' },
    { id: 'pe-2', partnerName: 'Mariama', serviceLogo: '🎵', serviceName: 'Spotify Duo', date: '20 Juin 2026', status: 'active', phone: '+221770000002' },
    { id: 'pe-3', partnerName: 'Boubacar', serviceLogo: '📺', serviceName: 'Canal+ Escale', date: '02 Juin 2026', status: 'completed', phone: '+221770000003' },
  ]);
  const [listings, setListings] = useState<ListingItem[]>([
    { id: 'ex-1', offeringUser: 'Amadou', offeredSub: 'Profil Netflix', wantedSub: 'Profil Spotify', status: 'available', createdAt: 'il y a 2 heures' },
    { id: 'ex-2', offeringUser: 'Mariama', offeredSub: 'Profil Spotify', wantedSub: 'Profil Netflix', status: 'available', createdAt: 'il y a 4 heures' },
    { id: 'ex-3', offeringUser: 'Boubacar', offeredSub: 'Profil Canal+', wantedSub: 'Profil Disney+', status: 'available', createdAt: 'il y a 5 heures' }
  ]);
  const [trustScore, setTrustScore] = useState<number>(85);
  const [history, setHistory] = useState<any[]>([]);
  const [offeredSubInput, setOfferedSubInput] = useState<string>('Netflix');
  const [wantedSubInput, setWantedSubInput] = useState<string>('Spotify');
  const [tempAvatar, setTempAvatar] = useState<string>('');
  const [isAvatarZoomed, setIsAvatarZoomed] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('onyx_token');
    const userId = localStorage.getItem('onyx_user_id');
    if (!token || !userId) {
      window.location.replace('/login');
      return;
    }

    const savedPhone = localStorage.getItem('onyx_user_phone') || '77 000 00 00';
    const savedName = localStorage.getItem('onyx_user_name') || 'Client Onyx';
    const savedEmail = localStorage.getItem('onyx_user_email') || 'client@onyx.sn';
    const savedAvatar = localStorage.getItem('onyx_user_avatar') || '';
    const premiumSaved = localStorage.getItem('onyx_is_premium') === 'true';
    
    setIsUserPremium(premiumSaved);
    setPremiumActiveTab(premiumSaved ? 'premium' : 'gratuit');

    const savedTheme = localStorage.getItem('onyx_theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      setIsDarkMode(true);
    } else {
      document.body.classList.remove('dark-theme');
      setIsDarkMode(false);
    }

    // Load cached wallet data to prevent visual flickering
    const cachedBalance = localStorage.getItem('onyx_user_balance');
    if (cachedBalance) setBalance(Number(cachedBalance));
    const cachedBudget = localStorage.getItem('onyx_user_budget_limit');
    if (cachedBudget) setBudgetLimit(Number(cachedBudget));

    setUserInfo({
      name: savedName,
      email: savedEmail,
      phone: savedPhone,
      isPremium: premiumSaved
    });
    setEditName(savedName);
    setEditEmail(savedEmail);
    setEditPhone(savedPhone);
    setUserAvatar(savedAvatar);
    setIsLoaded(true);

    if (userId) {
      fetch('http://localhost:5000/wallet', {
        headers: { 'x-user-id': userId }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Erreur de chargement');
        })
        .then(data => {
          setBalance(Number(data.balance));
          setBudgetLimit(Number(data.budgetLimit));
          localStorage.setItem('onyx_user_balance', data.balance.toString());
          localStorage.setItem('onyx_user_budget_limit', data.budgetLimit.toString());
        })
        .catch(() => console.log('Utilisation des données de secours locales.'));
    }

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'concierge' || tabParam === 'exchange' || tabParam === 'dashboard') {
      setCurrentView(tabParam as any);
    }
    const modalToOpen = params.get('openModal');
    if (modalToOpen === 'vault' || modalToOpen === 'profile-info' || modalToOpen === 'premium') {
      setActiveModal(modalToOpen as any);
    }
  }, []);

  useEffect(() => {
    const INACTIVITY_TIMEOUT = 600000; // 10 minutes
    const WARNING_TIMEOUT = 540000; // 9 minutes
    let logoutTimeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;
    let countdownIntervalId: NodeJS.Timeout;

    const resetTimer = () => {
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (countdownIntervalId) clearInterval(countdownIntervalId);

      setLogoutCountdown(null);

      warningTimeoutId = setTimeout(triggerWarning, WARNING_TIMEOUT);
      logoutTimeoutId = setTimeout(handleAutoLogout, INACTIVITY_TIMEOUT);
    };

    const triggerWarning = () => {
      let secondsLeft = 60;
      setLogoutCountdown(secondsLeft);

      countdownIntervalId = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          clearInterval(countdownIntervalId);
          handleAutoLogout();
        } else {
          setLogoutCountdown(secondsLeft);
        }
      }, 1000);
    };

    const handleAutoLogout = () => {
      console.log("Inactivité détectée. Sauvegarde des informations et déconnexion...");
      
      // Sauvegarde de secours des informations actuelles de session dans localStorage avant déconnexion
      localStorage.setItem('onyx_saved_phone', localStorage.getItem('onyx_user_phone') || '');
      localStorage.setItem('onyx_saved_name', localStorage.getItem('onyx_user_name') || '');
      localStorage.setItem('onyx_saved_email', localStorage.getItem('onyx_user_email') || '');
      
      // Nettoyer la session
      localStorage.removeItem('onyx_token');
      localStorage.removeItem('onyx_user_phone');
      localStorage.removeItem('onyx_user_name');
      localStorage.removeItem('onyx_user_email');
      
      window.location.href = '/login?reason=inactivity';
    };

    const token = localStorage.getItem('onyx_token');
    if (token) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('touchstart', resetTimer);

      resetTimer();
    }

    return () => {
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (countdownIntervalId) clearInterval(countdownIntervalId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('onyx_user_balance', balance.toString());
    }
  }, [balance, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('onyx_user_budget_limit', budgetLimit.toString());
    }
  }, [budgetLimit, isLoaded]);

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  
  // Active modals
  const [activeModal, setActiveModal] = useState<'none' | 'wallet' | 'sub-manage' | 'profile-info' | 'vault' | 'premium' | 'catalog' | 'plan-call' | 'propose-exchange'>('none');
  const [walletMode, setWalletMode] = useState<'depot' | 'retrait'>('depot');
  const [walletAmount, setWalletAmount] = useState<string>('');
  const [walletStep, setWalletStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  
  // Subscription selected for management
  const [selectedSub, setSelectedSub] = useState<SubItem | null>(null);

  // Subscriptions list
  const [subs, setSubs] = useState<SubItem[]>([
    {
      id: 'sub-netflix',
      name: 'Netflix',
      price: 5900,
      nextPayment: '19 Avril 2024',
      isVacationMode: false,
      isSmartSwapping: true,
      typeClass: 'netflix',
      logoLetter: 'N',
      usernameField: 'onyx.netflix@domain.com',
      passwordField: 'OnyxNetPass2026'
    },
    {
      id: 'sub-spotify',
      name: 'Spotify',
      price: 3500,
      nextPayment: '31 Avril 2024',
      isVacationMode: false,
      isSmartSwapping: true,
      typeClass: 'spotify',
      logoLetter: 'S',
      usernameField: 'onyx.spotify@domain.com',
      passwordField: 'OnyxSpotPass2026'
    },
    {
      id: 'sub-canal-1',
      name: 'Canal+',
      price: 10000,
      nextPayment: '19 Avril 2024',
      isVacationMode: false,
      isSmartSwapping: true,
      typeClass: 'canalplus',
      logoLetter: 'C',
      usernameField: 'onyx.canal1@domain.com',
      passwordField: 'OnyxCanalPass2026'
    },
    {
      id: 'sub-canal-2',
      name: 'Canal+',
      price: 10000,
      nextPayment: '15 Avril 2024',
      isVacationMode: false,
      isSmartSwapping: true,
      typeClass: 'canalplus',
      logoLetter: 'C',
      usernameField: 'onyx.canal2@domain.com',
      passwordField: 'OnyxCanalPass2026'
    }
  ]);

  // Extended catalog offers
  const catalogOffers: CatalogOffer[] = [
    { name: 'Netflix', price: 5900, typeClass: 'netflix', logoLetter: 'N' },
    { name: 'Spotify', price: 3500, typeClass: 'spotify', logoLetter: 'S' },
    { name: 'Canal+', price: 10000, typeClass: 'canalplus', logoLetter: 'C' },
    { name: 'Disney+', price: 4500, typeClass: 'canalplus', logoLetter: 'D' },
    { name: 'Amazon Prime', price: 3000, typeClass: 'netflix', logoLetter: 'A' },
    { name: 'Deezer', price: 3200, typeClass: 'spotify', logoLetter: 'D' },
    { name: 'Apple TV', price: 4900, typeClass: 'netflix', logoLetter: 'A' },
    { name: 'YouTube Premium', price: 4500, typeClass: 'spotify', logoLetter: 'Y' }
  ];

  // Catalog search/form states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCatalogOffer, setSelectedCatalogOffer] = useState<CatalogOffer | null>(null);
  const [newSubUser, setNewSubUser] = useState<string>('');
  const [newSubPass, setNewSubPass] = useState<string>('');

  // Password visibility triggers
  const [showSubPass, setShowSubPass] = useState<boolean>(false);

  // --- Handlers ---
  const handleToggleVacation = (id: string) => {
    setSubs(prevSubs =>
      prevSubs.map(sub =>
        sub.id === id ? { ...sub, isVacationMode: !sub.isVacationMode } : sub
      )
    );
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub(prev => prev ? { ...prev, isVacationMode: !prev.isVacationMode } : null);
    }
  };

  const handleToggleSmartSwapping = (id: string) => {
    setSubs(prevSubs =>
      prevSubs.map(sub =>
        sub.id === id ? { ...sub, isSmartSwapping: !sub.isSmartSwapping } : sub
      )
    );
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub(prev => prev ? { ...prev, isSmartSwapping: !prev.isSmartSwapping } : null);
    }
  };

  const handleUpdateSubCredentials = (id: string, user: string, pass: string) => {
    setSubs(prevSubs =>
      prevSubs.map(sub =>
        sub.id === id ? { ...sub, usernameField: user, passwordField: pass } : sub
      )
    );
  };

  const handleDeleteSub = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement de votre espace Onyx ?')) {
      setSubs(prev => prev.filter(sub => sub.id !== id));
      setActiveModal('none');
    }
  };

  const handleWalletTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(walletAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Veuillez entrer un montant valide.');
      return;
    }

    const userId = localStorage.getItem('onyx_user_id');

    if (walletMode === 'depot') {
      try {
        if (userId) {
          // 1. Initialise la recharge sur le serveur
          const rechargeRes = await fetch('http://localhost:5000/wallet/recharge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId
            },
            body: JSON.stringify({ amount: amountNum })
          });
          if (!rechargeRes.ok) throw new Error('Erreur de chargement');
          const rechargeData = await rechargeRes.json();

          // 2. Simule le callback du webhook de Wave
          const webhookRes = await fetch('http://localhost:5000/wallet/webhook/wave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceId: rechargeData.referenceId,
              amount: amountNum,
              status: 'completed'
            })
          });
          if (!webhookRes.ok) throw new Error('Erreur de confirmation');
        }

        setBalance(prev => prev + amountNum);
        alert(`Dépôt de ${amountNum.toLocaleString('fr-FR')} FCFA effectué avec succès.`);
      } catch (err) {
        alert('Erreur lors du dépôt. Mode hors-ligne activé.');
        setBalance(prev => prev + amountNum);
      }
    } else {
      if (amountNum > balance) {
        alert('Solde disponible insuffisant pour effectuer ce retrait.');
        return;
      }
      setBalance(prev => prev - amountNum);
      alert(`Retrait de ${amountNum.toLocaleString('fr-FR')} FCFA effectué avec succès.`);
    }

    setWalletAmount('');
    setActiveModal('none');
  };

  const handleCreateNewSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogOffer) return;

    const nextTotal = totalSubCost + selectedCatalogOffer.price;
    if (nextTotal > budgetLimit) {
      alert(`Action bloquée ! L'activation de ${selectedCatalogOffer.name} (${selectedCatalogOffer.price.toLocaleString('fr-FR')} FCFA) dépasse votre budget maximum autorisé (${budgetLimit.toLocaleString('fr-FR')} FCFA).\n\nPour continuer, veuillez augmenter votre budget maximum ou suspendre un abonnement actif (ex: Netflix ou Canal+).`);
      return;
    }

    if (!newSubUser || !newSubPass) {
      alert('Veuillez remplir les accès de connexion pour l\'offre choisie.');
      return;
    }

    const newSub: SubItem = {
      id: `sub-${Date.now()}`,
      name: selectedCatalogOffer.name,
      price: selectedCatalogOffer.price,
      nextPayment: '1er du mois prochain',
      isVacationMode: false,
      isSmartSwapping: true,
      typeClass: selectedCatalogOffer.typeClass,
      logoLetter: selectedCatalogOffer.logoLetter,
      usernameField: newSubUser,
      passwordField: newSubPass
    };

    setSubs(prev => [...prev, newSub]);
    alert(`Abonnement à ${selectedCatalogOffer.name} lié avec succès dans votre espace !`);
    
    // Reset states
    setNewSubUser('');
    setNewSubPass('');
    setSelectedCatalogOffer(null);
    setSearchTerm('');
    setActiveModal('none');
  };

  const [isMakingSuggestion, setIsMakingSuggestion] = useState<boolean>(false);
  const [suggestedName, setSuggestedName] = useState<string>('');
  const [suggestedPrice, setSuggestedPrice] = useState<string>('');
  const [suggestedComments, setSuggestedComments] = useState<string>('');

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedName) {
      alert('Veuillez renseigner le nom du service suggéré.');
      return;
    }
    alert(`Merci pour votre suggestion ! L'équipe Onyx va étudier l'ajout de "${suggestedName}" très prochainement.`);
    
    // Reset suggestion fields and return to catalog list
    setSuggestedName('');
    setSuggestedPrice('');
    setSuggestedComments('');
    setIsMakingSuggestion(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert("Les nouveaux mots de passe ne correspondent pas.");
        return;
      }
      if (!oldPassword) {
        alert("Veuillez saisir votre ancien mot de passe pour confirmer la modification.");
        return;
      }
      
      const token = localStorage.getItem('onyx_token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/auth/change-password', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Erreur lors du changement de mot de passe.');
          }
          showToast('Profil et mot de passe mis à jour !', 'success');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } catch (err: any) {
          showToast(err.message, 'warning');
          return; // Stop profile update on password error
        }
      }
    } else {
      showToast('Profil mis à jour avec succès !', 'success');
    }

    setUserInfo({
      name: editName,
      email: editEmail,
      phone: editPhone,
      isPremium: true
    });
    localStorage.setItem('onyx_user_name', editName);
    localStorage.setItem('onyx_user_email', editEmail);
    localStorage.setItem('onyx_user_phone', editPhone);
    setActiveModal('none');
  };

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBudgetLimit(val);

    const userId = localStorage.getItem('onyx_user_id');
    if (userId) {
      try {
        await fetch('http://localhost:5000/wallet/budget-limit', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({ limit: val })
        });
      } catch (err) {
        console.log('Erreur de synchronisation du budget (Hors-ligne).');
      }
    }
  };

  const handleToggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('onyx_theme', isDark ? 'dark' : 'light');
    setIsDarkMode(isDark);
  };

  const handleLogout = () => {
    localStorage.removeItem('onyx_token');
    localStorage.removeItem('onyx_user_phone');
    localStorage.removeItem('onyx_user_name');
    localStorage.removeItem('onyx_user_email');
    window.location.href = '/login';
  };

  // --- Concierge Helpers ---
  const timeSlots = [
    'Lundi 10:00',
    'Lundi 14:00',
    'Mardi 11:00',
    'Mardi 16:00',
    'Mercredi 09:00',
    'Mercredi 15:00',
    'Jeudi 10:00',
    'Jeudi 14:00',
    'Vendredi 11:00',
    'Vendredi 16:00'
  ];

  const handlePlanCall = () => {
    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau horaire.');
      return;
    }
    alert(`Appel planifié avec succès pour le : ${selectedSlot}.`);
    setActiveModal('none');
  };

  // --- Exchange Helpers ---
  const handleProposeExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (trustScore <= 30) {
      alert('Votre score de confiance est trop bas pour effectuer des propositions.');
      return;
    }

    const priceText = proposeCost === '0' || !proposeCost ? 'Échange Direct' : `${proposeCost} FCFA / mois`;
    const serviceLogo = offeredSubInput === 'Netflix' ? '🎥' : offeredSubInput === 'Spotify' ? '🎵' : offeredSubInput === 'Canal+' ? '📺' : '🍿';

    const localNewProposal = {
      id: `ex-${Date.now()}`,
      offeringUser: userInfo.name || 'Moi',
      service: offeredSubInput,
      logo: serviceLogo,
      profileType: 'Profil Partagé - Écran Standard',
      cost: priceText,
      trustScore: trustScore,
      status: 'available' as const,
      offeredSub: `Profil ${offeredSubInput}`,
      wantedSub: `Profil ${wantedSubInput}`,
      createdAt: 'À l\'instant'
    };

    const token = localStorage.getItem('onyx_token');
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/exchange/propose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            offeredSubName: offeredSubInput,
            wantedSubName: wantedSubInput
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Erreur lors de la proposition.');
        }

        const ex = await res.json();
        const apiProposal = {
          ...localNewProposal,
          id: ex.id,
          offeringUser: ex.offeringUserPhone || userInfo.name || 'Moi'
        };

        setListings(prev => [apiProposal, ...prev]);
        setActiveModal('none');
        setProposeAccessDetails('');
        alert('Votre proposition d\'abonnement a été publiée avec succès.');
      } catch (err: any) {
        alert('Mode hors-ligne / Simulation activée.');
        setListings(prev => [localNewProposal, ...prev]);
        setActiveModal('none');
        setProposeAccessDetails('');
      }
    } else {
      setListings(prev => [localNewProposal, ...prev]);
      setActiveModal('none');
      setProposeAccessDetails('');
      alert('Votre proposition d\'abonnement a été publiée (Simulation locale).');
    }
  };

  const handleAcceptExchange = async (id: string) => {
    const target = listings.find(item => item.id === id);
    if (!target) return;

    const localNewPartner = {
      id: `pe-${Date.now()}`,
      partnerName: target.offeringUser,
      serviceLogo: offeredSubInput === 'Netflix' ? '🎥' : offeredSubInput === 'Spotify' ? '🎵' : offeredSubInput === 'Canal+' ? '📺' : '🍿',
      serviceName: target.offeredSub,
      date: 'À l\'instant',
      status: 'active',
      phone: '+221770000000'
    };

    const token = localStorage.getItem('onyx_token');
    if (token) {
      try {
        const res = await fetch(`http://localhost:5000/exchange/accept/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Erreur lors de l\'acceptation.');
        }

        alert(`Échange accepté avec succès ! Vous échangez avec ${target.offeringUser}. La conciergerie a été notifiée pour configurer les accès.`);
        
        setListings(prev => prev.filter(item => item.id !== id));
        setPastExchanges(prev => [localNewPartner, ...prev]);
      } catch (err: any) {
        alert('Simulation de l\'échange (mode local).');
        setPastExchanges(prev => [localNewPartner, ...prev]);
        setListings(prevList => prevList.filter(item => item.id !== id));
      }
    } else {
      setListings(prev => prev.filter(item => item.id !== id));
      setPastExchanges(prev => [localNewPartner, ...prev]);
      alert(`Échange accepté avec succès ! Vous partagez désormais avec ${target.offeringUser}. (Simulation locale)`);
    }
  };

  const handleTriggerLitige = (item: any) => {
    setLitigeTarget(item);
    setIsLitigeOpen(true);
  };

  const handleConfirmLitige = () => {
    if (!litigeTarget) return;

    setTrustScore(prev => Math.max(0, prev - 30));

    setNotationHistory(prev => [
      {
        id: `n-${Date.now()}`,
        change: -30,
        reason: `Signalement d'accès bloqué (Garantie Onyx active sur ${litigeTarget.service})`,
        date: 'À l\'instant'
      },
      ...prev
    ]);

    setMyJoinedSubs(prev => 
      prev.map(sub => sub.id === litigeTarget.id ? { ...sub, status: 'fallback_active' } : sub)
    );

    alert(`Garantie Onyx Déclenchée !\n\n- La transaction financière avec le propriétaire a été figée.\n- Un malus de -30 points de confiance a été appliqué au profil concerné.\n- Vous avez été basculé temporairement sur un profil de secours ${litigeTarget.service} fourni par Onyx (SLA 24h) le temps de résoudre le conflit.`);
    setIsLitigeOpen(false);
    setLitigeTarget(null);
  };

  const renderConciergeView = () => {
    return (
      <div className="dashboard-grid">
        {/* Left Column - Financial Actions & Tools */}
        <section className="dashboard-section">
          
          {/* 1. Affichage du Solde Réel & Recharge Wave */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="balance-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>💰 Solde Réel Onyx</span>
                <div style={{ fontSize: '2.2rem', fontWeight: '950', color: '#000000', marginTop: '4px' }}>
                  {balance.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>💼</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <button 
                className="btn-primary-dark"
                style={{ padding: '12px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => { setWalletStep(1); setPaymentMethod(''); setActiveModal('wallet'); }}
              >
                💸 Dépôt / Retrait
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>⚡ Transfert instantané</span>
              <span>🔒 Sécurisé par Wave API</span>
            </div>
          </div>

          {/* 2. Calculateur et Suivi des Devises */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💱 Calculateur & Suivi des Devises</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Facturation transparente des devises étrangères converties en FCFA.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label className="onboarding-label" style={{ fontSize: '0.75rem' }}>Montant</label>
                  <input 
                    type="number" 
                    className="onboarding-input"
                    value={deviseInput}
                    onChange={(e) => setDeviseInput(e.target.value)}
                    style={{ padding: '8px 12px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="onboarding-label" style={{ fontSize: '0.75rem' }}>Devise</label>
                  <select 
                    className="select-input"
                    value={deviseType}
                    onChange={(e) => setDeviseType(e.target.value as 'EUR' | 'USD')}
                    style={{ height: '39px', padding: '0 8px', fontSize: '0.85rem' }}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {(() => {
                const val = Number(deviseInput) || 0;
                const rate = deviseType === 'EUR' ? 655.957 : 612.45;
                const marginValue = isUserPremium ? 0 : (val * rate * 0.025);
                const total = val * rate + marginValue;

                return (
                  <div style={{ padding: '14px', backgroundColor: '#fcfcfb', border: '1.5px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Taux de change (BCE) :</span>
                      <span style={{ fontWeight: '700' }}>1 {deviseType} = {rate.toFixed(2)} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Marge commerciale ({isUserPremium ? 'Premium 0%' : 'Gratuit 2.5%'}) :</span>
                      <span style={{ fontWeight: '700', color: isUserPremium ? '#2e7d32' : '#e65100' }}>
                        {isUserPremium ? '0 FCFA' : `${marginValue.toFixed(0)} FCFA`}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '4px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '900' }}>
                      <span>Total estimé :</span>
                      <span>{total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</span>
                    </div>
                    {!isUserPremium && (
                      <div style={{ fontSize: '0.72rem', color: '#8c8c88', fontStyle: 'italic', marginTop: '4px', lineHeight: '1.3' }}>
                        💡 La marge couvre les variations de taux interbancaires. Passez Premium pour l'annuler.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 3. Outil de Split-Billing (Partage de frais) */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥 Outil de Split-Billing (Partage de frais)</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Divisez le coût d'un abonnement familial et suivez les remboursements.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1.5 }}>
                  <label className="onboarding-label" style={{ fontSize: '0.75rem' }}>Service</label>
                  <select 
                    className="select-input"
                    value={splitService}
                    onChange={(e) => {
                      setSplitService(e.target.value);
                      if (e.target.value === 'Netflix') setSplitCustomPrice('6500');
                      else if (e.target.value === 'Spotify') setSplitCustomPrice('4900');
                      else if (e.target.value === 'Canal+') setSplitCustomPrice('10000');
                    }}
                    style={{ height: '39px', padding: '0 8px', fontSize: '0.85rem' }}
                  >
                    <option value="Netflix">Netflix Premium (6 500 F)</option>
                    <option value="Spotify">Spotify Duo (4 900 F)</option>
                    <option value="Canal+">Canal+ Escale (10 000 F)</option>
                    <option value="Custom">Autre Service</option>
                  </select>
                </div>
                {splitService === 'Custom' && (
                  <div style={{ flex: 1 }}>
                    <label className="onboarding-label" style={{ fontSize: '0.75rem' }}>Prix (FCFA)</label>
                    <input 
                      type="number"
                      className="onboarding-input"
                      value={splitCustomPrice}
                      onChange={(e) => setSplitCustomPrice(e.target.value)}
                      style={{ padding: '8px 12px' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label className="onboarding-label" style={{ fontSize: '0.75rem' }}>Participants</label>
                  <select 
                    className="select-input"
                    value={splitCount}
                    onChange={(e) => setSplitCount(Number(e.target.value))}
                    style={{ height: '39px', padding: '0 8px', fontSize: '0.85rem' }}
                  >
                    <option value="2">2 pers.</option>
                    <option value="3">3 pers.</option>
                    <option value="4">4 pers.</option>
                    <option value="5">5 pers.</option>
                    <option value="6">6 pers.</option>
                  </select>
                </div>
              </div>

              {(() => {
                const price = Number(splitCustomPrice) || 0;
                const perPerson = price / splitCount;

                const handleShare = () => {
                  const message = `Salut ! Voici ta part pour l'abonnement ${splitService} : ${perPerson.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA. Tu peux me rembourser sur Onyx via Wave. Merci !`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                };

                return (
                  <div style={{ padding: '14px', backgroundColor: '#fcfcfb', border: '1.5px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Part individuelle :</span>
                      <span style={{ fontWeight: '950', fontSize: '1rem', color: '#111110' }}>
                        {perPerson.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / pers.
                      </span>
                    </div>
                    
                    {/* Friends status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        Suivi des Co-abonnés
                      </div>
                      {splitFriends.slice(0, Math.min(splitCount - 1, splitFriends.length)).map((f, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <span>👤 {f.name}</span>
                          <span 
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '2px 8px', 
                              borderRadius: '12px',
                              fontWeight: 'bold',
                              color: f.status === 'completed' ? '#2e7d32' : '#8c8c88',
                              backgroundColor: f.status === 'completed' ? '#e8f5e9' : '#f5f5f5',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              const updated = [...splitFriends];
                              updated[i].status = updated[i].status === 'completed' ? 'pending' : 'completed';
                              setSplitFriends(updated);
                            }}
                            title="Cliquer pour changer le statut"
                          >
                            {f.status === 'completed' ? 'Payé ✅' : 'En attente ⏳'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="btn-primary-dark"
                      onClick={handleShare}
                      style={{ marginTop: '6px', padding: '10px', fontSize: '0.82rem', fontWeight: '800', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <span>💬 Partager la demande (WhatsApp)</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

        </section>

        {/* Right Column - Status, Planning & Timeline */}
        <section className="dashboard-section">
          
          {/* 4. Planification et Gestion des Échéances */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📅 Planification & Gestion des Échéances</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Prochains prélèvements automatisés de vos abonnements tiers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Netflix Premium', price: 6500, date: '05 Juillet 2026' },
                { name: 'Spotify Duo', price: 4900, date: '12 Juillet 2026' },
                { name: 'Canal+ Escale', price: 10000, date: '22 Juillet 2026' },
              ].map((item, index) => {
                const hasEnough = balance >= item.price;
                return (
                  <div key={index} style={{ padding: '12px 14px', border: '1.5px solid var(--border-color)', borderRadius: '12px', backgroundColor: '#fcfcfb', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>{item.name}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>{item.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Échéance : {item.date}</span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: '800', 
                        color: hasEnough ? '#2e7d32' : '#d32f2f',
                        backgroundColor: hasEnough ? '#e8f5e9' : '#ffebee',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {hasEnough ? 'Provision Suffisante ✅' : 'Solde Insuffisant ⚠️'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Historique des Transactions */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜 Historique des Transactions</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Journal complet et détaillé de vos mouvements de fonds.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {transactions.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: '800' }}>
                      {tx.type === 'recharge' ? `📥 Recharge ${tx.method}` : tx.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{tx.date}</span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: '900', color: tx.amount > 0 ? '#2e7d32' : '#000000' }}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString('fr-FR')}` : tx.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 'bold' }}>Réussi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Coffre-fort Budgétaire */}
          <div className="side-panel" style={{ padding: '24px', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '6px' }}>🔒 Coffre-fort Budgétaire</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Gérez vos limites de dépenses, historiques de clés et mots de passe chiffrés.
              </p>
            </div>
            <button 
              className="btn-primary-dark"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setActiveModal('vault')}
            >
              Ouvrir mon Coffre-fort
            </button>
          </div>

          {/* Support Call & WhatsApp */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#000000' }}>
              Demandes de conciergerie : {requests.length} en cours
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                className="whatsapp-btn"
                onClick={() => window.open('https://wa.me/221770000000', '_blank')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
              >
                WhatsApp 💬
              </button>
              <button 
                className="btn-secondary-outline"
                style={{ padding: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                onClick={() => setActiveModal('plan-call')}
              >
                Planifier Appel 📞
              </button>
            </div>
          </div>

        </section>
      </div>
    );
  };

  const renderExchangeView = () => {
    return (
      <div className="dashboard-grid">
        {/* Column 1: Trust Score & Marketplace */}
        <section className="dashboard-section">
          
          {/* 1. Le Tableau de Bord du « Score de Confiance » */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0' }}>🔰 Tableau de Bord du Score de Confiance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Votre réputation au sein de la communauté de partage Onyx.
              </p>
            </div>

            {/* Jauge de confiance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>
                <span>Jauge de confiance :</span>
                <span style={{ color: trustScore > 70 ? '#2e7d32' : trustScore > 40 ? '#ffd000' : '#d32f2f' }}>
                  {trustScore}/100 ({trustScore > 70 ? 'Excellent' : trustScore > 40 ? 'Moyen' : 'Critique'})
                </span>
              </div>
              <div className="trust-score-bar-bg" style={{ height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  className="trust-score-bar-fill" 
                  style={{ 
                    width: `${trustScore}%`, 
                    height: '100%', 
                    backgroundColor: trustScore > 70 ? '#2e7d32' : trustScore > 40 ? '#ffd000' : '#d32f2f',
                    transition: 'width 0.5s ease-in-out'
                  }}
                ></div>
              </div>
            </div>

            {/* Historique des notations */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '850', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Historique des Notations
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {notationHistory.map((n) => (
                  <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '80%' }}>
                      <span style={{ color: '#111110', fontWeight: '500' }}>{n.reason}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.date}</span>
                    </div>
                    <span style={{ fontWeight: '850', color: n.change > 0 ? '#2e7d32' : '#d32f2f' }}>
                      {n.change > 0 ? `+${n.change}` : n.change} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Le Flux des Offres Disponibles (Le Marché) */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', minHeight: '565px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0' }}>🛒 Le Marché aux Partages</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Rejoignez des profils vacants vérifiés de la communauté.
                </p>
              </div>

              {/* Floating yellow "+" button */}
              <button 
                onClick={() => setActiveModal('propose-exchange')}
                style={{
                  backgroundColor: '#ffd000',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  fontSize: '1.4rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255, 208, 0, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                title="Proposer un profil"
              >
                +
              </button>
            </div>

            {/* Filtres par Plateforme */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['All', 'Netflix', 'Spotify', 'Canal+', 'Crunchyroll'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setExchangeActiveTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    border: '1.5px solid',
                    borderColor: exchangeActiveTab === tab ? '#111110' : 'var(--border-color)',
                    backgroundColor: exchangeActiveTab === tab ? '#111110' : '#ffffff',
                    color: exchangeActiveTab === tab ? '#ffffff' : '#111110',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab === 'All' ? 'Tous' : tab}
                </button>
              ))}
            </div>

            {/* Cartes d'Échange */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px', maxHeight: '410px', overflowY: 'auto', paddingRight: '4px' }}>
              {listings
                .filter((item) => exchangeActiveTab === 'All' || item.service === exchangeActiveTab || item.offeredSub.includes(exchangeActiveTab))
                .map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '16px', 
                      border: '1.5px solid var(--border-color)', 
                      borderRadius: '16px', 
                      backgroundColor: '#fcfcfb', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="exchange-logo-badge">
                          <span>{item.logo || '🎥'}</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: '900', fontSize: '0.92rem' }}>{item.service || item.offeredSub}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.profileType || 'Profil Partagé'}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '950', color: '#111110' }}>{item.cost}</div>
                        <div style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: '700', marginTop: '2px' }}>
                          👤 Trust: {item.trustScore || 85}/100
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Proposé par {item.offeringUser}</span>
                      <button 
                        className="btn-primary-dark"
                        style={{ padding: '6px 16px', fontSize: '0.78rem', fontWeight: '800' }}
                        onClick={() => handleAcceptExchange(item.id)}
                      >
                        Rejoindre
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </section>

        {/* Column 2: Guided Propose & Safety Litige */}
        <section className="dashboard-section">
          
          {/* 3. Le Module « Proposer un Profil » */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0' }}>➕ Proposer une place d'Abonnement</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Partagez une place libre et accumulez des fonds dans votre portefeuille.
              </p>
            </div>

            <button 
              className="btn-primary-dark"
              style={{ width: '100%', padding: '12px', fontWeight: '800', backgroundColor: '#ffd000', color: '#000000', border: '1.5px solid #ffd000' }}
              onClick={() => setActiveModal('propose-exchange')}
            >
              📢 Mettre un Profil en Ligne
            </button>
          </div>

          {/* 4. La Passerelle de Litige & Sécurité (Garantie Onyx) */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️ Garantie Onyx & Passerelle de Litige</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Protection intégrale contre les changements de mots de passe ou blocages d'accès.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myJoinedSubs.map((sub) => (
                <div 
                  key={sub.id} 
                  style={{ 
                    padding: '12px 14px', 
                    border: '1.5px solid var(--border-color)', 
                    borderRadius: '12px', 
                    backgroundColor: sub.status === 'fallback_active' ? '#ffebee' : '#fcfcfb', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>{sub.service}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Propriétaire : {sub.owner}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block' }}>{sub.cost}</span>
                    </div>
                  </div>

                  {sub.status === 'fallback_active' ? (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#ffd5d5', color: '#c62828', fontSize: '0.75rem', fontWeight: '800', lineHeight: '1.3' }}>
                      🔒 PROFIL DE SECOURS ACTIF (SLA 24H)<br/>
                      Transaction gelée. Notre administration examine le litige.
                    </div>
                  ) : (
                    <button
                      className="btn-secondary-outline"
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        color: '#d32f2f', 
                        borderColor: '#d32f2f',
                        backgroundColor: 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleTriggerLitige(sub)}
                    >
                      ⚠️ Signalement / Accès bloqué
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Partenaires & Historique des Échanges */}
          <div className="side-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤝 Partenaires & Historique des Échanges</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Suivez les membres avec qui vous partagez ou avez déjà partagé des accès.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pastExchanges.map((pe) => (
                <div key={pe.id} style={{ padding: '12px 14px', border: '1.5px solid var(--border-color)', borderRadius: '12px', backgroundColor: '#fcfcfb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="exchange-logo-badge-sm">
                        <span>{pe.serviceLogo}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '800', fontSize: '0.88rem', display: 'block' }}>{pe.partnerName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pe.serviceName} • {pe.date}</span>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '800', 
                      color: pe.status === 'active' ? '#2e7d32' : '#8c8c88',
                      backgroundColor: pe.status === 'active' ? '#e8f5e9' : '#f5f5f5',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {pe.status === 'active' ? 'Actif' : 'Terminé'}
                    </span>
                  </div>

                  <button
                    className="whatsapp-btn"
                    onClick={() => window.open(`https://wa.me/${pe.phone.replace('+', '')}?text=Salut ${pe.partnerName} ! Je te contacte au sujet de notre échange Onyx.`, '_blank')}
                    style={{ 
                      width: '100%', 
                      padding: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    💬 Contacter via WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>
    );
  };
    
  // Filter catalog offers based on search term
  const filteredOffers = catalogOffers.filter(offer =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculations
  const totalSubCost = subs.reduce((acc, sub) => acc + (sub.isVacationMode ? 0 : sub.price), 0);
  const isBudgetExceeded = totalSubCost > budgetLimit;

  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        backgroundColor: '#060608', 
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💎</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Onyx</div>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '6px' }}>Chargement de votre espace sécurisé...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Head>
        <title>Onyx - Tableau de bord</title>
        <meta name="description" content="Gérez et optimisez vos abonnements." />
        <link rel="icon" href="/logo.png" />
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }

          /* Sidebar manual overrides */
          .sidebar {
            width: var(--sidebar-width-collapsed) !important;
            position: relative;
          }
          .sidebar.expanded {
            width: var(--sidebar-width-expanded) !important;
          }
          .sidebar.collapsed {
            width: var(--sidebar-width-collapsed) !important;
          }
          .main-content {
            margin-left: var(--sidebar-width-collapsed) !important;
          }
          .sidebar.expanded ~ .main-content {
            margin-left: var(--sidebar-width-expanded) !important;
          }
          .sidebar .sidebar-brand-name-img, .sidebar .sidebar-item-label {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: opacity 0.15s ease-in-out, visibility 0.15s ease-in-out;
          }
          .sidebar.expanded .sidebar-brand-name-img, .sidebar.expanded .sidebar-item-label {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }
          .sidebar-item {
            overflow: hidden !important;
            max-width: 100% !important;
            white-space: nowrap !important;
          }
          .sidebar-toggle-btn {
            position: absolute;
            top: 68px;
            right: -12px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: var(--panel-bg);
            border: 1.5px solid var(--border-color);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-family: monospace;
            font-weight: bold;
            font-size: 0.85rem;
            transition: var(--transition-smooth);
            pointer-events: auto;
          }
          .sidebar-toggle-btn:hover {
            background-color: #ffd000;
            color: #000000;
            border-color: #ffd000;
            transform: scale(1.1);
          }
        `}</style>
      </Head>

      {/* Retractable Sidebar */}
      <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <button 
          type="button" 
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          title={isSidebarExpanded ? "Réduire le menu" : "Agrandir le menu"}
        >
          {isSidebarExpanded ? '<' : '>'}
        </button>
        <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
          <div className="sidebar-logo">
            <img src={isDarkMode ? "/logo_dark.png" : "/logo_light.png"} alt="Onyx Logo" className="sidebar-logo-img" />
          </div>
          <img src={isDarkMode ? "/name_dark.png" : "/name_light.png"} alt="ONYX" className="sidebar-brand-name-img" />
        </div>

        <nav className="sidebar-menu">
          <button 
            type="button" 
            onClick={() => setCurrentView('dashboard')} 
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span className="sidebar-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <span className="sidebar-item-label">Accueil / Tableau de bord</span>
          </button>
          <button 
            type="button" 
            onClick={() => setCurrentView('concierge')} 
            className={`sidebar-item ${currentView === 'concierge' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span className="sidebar-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            </span>
            <span className="sidebar-item-label">Portefeuille / Finances</span>
          </button>
          <button 
            type="button" 
            onClick={() => setCurrentView('exchange')} 
            className={`sidebar-item ${currentView === 'exchange' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span className="sidebar-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span className="sidebar-item-label">Groupe / Communauté</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <a className="sidebar-item" onClick={handleLogout}>
            <span className="sidebar-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span className="sidebar-item-label">Déconnexion</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Header */}
        <header className="header">
          <h1 className="header-title">
            {currentView === 'dashboard' ? 'Tableau de bord' : currentView === 'concierge' ? 'Portefeuille / Finances' : "Bourse d'Échange"}
          </h1>
          
          <div className="header-right">
            {/* Wallet Quick Access */}
            <div className="balance-module">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="balance-label">Solde Disponible</span>
                <span className="balance-amount">{balance.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button 
                className="recharge-btn" 
                style={{ backgroundColor: '#ffd000', color: '#000000', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255, 208, 0, 0.4)', transition: 'transform 0.15s' }}
                onClick={() => { setWalletStep(1); setPaymentMethod(''); setActiveModal('wallet'); }}
              >
                +
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleTheme}
              style={{
                background: 'none',
                border: '1.5px solid var(--border-color)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.1rem',
                backgroundColor: 'var(--panel-bg)',
                color: 'var(--text-primary)',
                transition: 'var(--transition-smooth)',
                marginRight: '12px'
              }}
              title="Changer de thème (Clair / Sombre)"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* Profile Dropdown */}
            <div className="profile-dropdown" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <img 
                src={userAvatar || DEFAULT_AVATAR} 
                alt="Profil" 
                className="profile-avatar"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.25s ease'
                }}
              />
              <span className="profile-arrow">▼</span>

              {isProfileOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-item" onClick={() => setActiveModal('profile-info')}>👤 Mes Infos</div>
                  <div className="dropdown-item" onClick={() => setActiveModal('vault')}>🔒 Coffre-fort</div>
                  <div className="dropdown-item" onClick={() => setActiveModal('premium')}>⭐ Offre Premium</div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" style={{ color: 'red' }} onClick={handleLogout}>🚪 Déconnexion</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        {currentView === 'dashboard' && (
          <div className="dashboard-grid">
          
          {/* Left Column */}
          <section className="dashboard-section">
            
            {/* ONBOARDING BANNER */}
            <div style={{
              backgroundColor: 'var(--panel-bg)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>👋</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Bienvenue sur votre assistant Onyx</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Gérez en toute sérénité vos abonnements. Approvisionnez votre compte, découvrez de nouvelles offres, ou paramétrez vos budgets dans votre Coffre-fort.
              </p>
            </div>

            {/* Section A: Active subscriptions */}
            <div className="section-header">
              <h2>Vos abonnements actifs</h2>
            </div>

            <div className="subs-grid">
              {subs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1.5px dashed var(--border-color)', borderRadius: '24px', gridColumn: '1 / -1' }}>
                  Aucun abonnement lié. Parcourez la section <strong>Nouvelles offres</strong> ci-dessous pour ajouter un service.
                </div>
              ) : (
                subs.map(sub => (
                  <div key={sub.id} className="sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: sub.isVacationMode ? '1.5px dashed #ccc' : '1.5px solid var(--border-color)', opacity: sub.isVacationMode ? 0.75 : 1 }}>
                    
                    {/* Header: Icon, Name, Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={`sub-icon ${sub.typeClass}`} style={{ width: '42px', height: '42px', fontSize: '1.15rem' }}>
                          {sub.logoLetter}
                        </div>
                        <div>
                          <span className="sub-name" style={{ display: 'block', fontWeight: '900', fontSize: '1rem' }}>{sub.name}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {sub.price.toLocaleString('fr-FR')} FCFA / mois
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        {sub.isVacationMode && (
                          <span style={{ backgroundColor: '#e0f7fa', color: '#006064', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            🏖️ VACANCES
                          </span>
                        )}
                        {sub.isSmartSwapping && (
                          <span style={{ backgroundColor: '#fff8e1', color: '#ff8f00', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            🔄 SWAP ACTIF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details: Billing Date */}
                    <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: '#fdfdfd', border: '1px solid #f5f5f5', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Prochain prélèvement :</span>
                      <strong style={{ color: '#000000', fontWeight: '800' }}>{sub.nextPayment}</strong>
                    </div>

                    {/* Concierge buttons direct on card */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                      <button 
                        className="btn-secondary-outline"
                        style={{ 
                          padding: '8px', 
                          fontSize: '0.74rem', 
                          fontWeight: '800', 
                          borderColor: sub.isVacationMode ? '#006064' : 'var(--border-color)',
                          backgroundColor: sub.isVacationMode ? '#e0f7fa' : 'transparent',
                          color: sub.isVacationMode ? '#006064' : '#000000'
                        }}
                        onClick={() => handleToggleVacation(sub.id)}
                        title="Suspendre temporairement l'abonnement via la Conciergerie Onyx"
                      >
                        {sub.isVacationMode ? '🏖️ Reprendre' : '🏖️ Vacances'}
                      </button>
                      
                      <button 
                        className="btn-secondary-outline"
                        style={{ 
                          padding: '8px', 
                          fontSize: '0.74rem', 
                          fontWeight: '800',
                          borderColor: sub.isSmartSwapping ? '#ff8f00' : 'var(--border-color)',
                          backgroundColor: sub.isSmartSwapping ? '#fff8e1' : 'transparent',
                          color: sub.isSmartSwapping ? '#b77900' : '#000000'
                        }}
                        onClick={() => handleToggleSmartSwapping(sub.id)}
                        title="Demander l'échange intelligent avec un autre service"
                      >
                        {sub.isSmartSwapping ? '🔄 Swap Actif' : '🔄 Swapping'}
                      </button>
                    </div>

                    {/* Manage settings popup link */}
                    <button 
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: 'var(--text-secondary)', 
                        textDecoration: 'underline', 
                        fontSize: '0.74rem', 
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '4px 0 0 0',
                        textAlign: 'center'
                      }}
                      onClick={() => { setSelectedSub(sub); setActiveModal('sub-manage'); }}
                    >
                      ⚙️ Gérer les accès & identifiants
                    </button>

                  </div>
                ))
              )}
            </div>

            {/* Section B: New Offers section matching user request */}
            <div className="section-header" style={{ marginTop: '24px' }}>
              <h2>Nouvelles offres</h2>
            </div>

            <div className="subs-grid">
              {/* Curious/popular preview cards */}
              <div className="sub-card" style={{ backgroundColor: '#ffffff' }}>
                <div className="sub-card-header">
                  <div className="sub-info">
                    <div className="sub-icon netflix">N</div>
                    <span className="sub-name">Netflix Premium</span>
                  </div>
                </div>
                <div className="sub-details">
                  <span className="sub-detail-label">Tarif mensuel :</span>
                  <span className="sub-detail-value">5 900 FCFA</span>
                </div>
                <button 
                  className="btn-secondary-outline" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem', marginTop: '8px' }}
                  onClick={() => {
                    setSelectedCatalogOffer(catalogOffers[0]);
                    setNewSubUser('');
                    setNewSubPass('');
                    setActiveModal('catalog');
                  }}
                >
                  Découvrir & Lier
                </button>
              </div>

              <div className="sub-card" style={{ backgroundColor: '#ffffff' }}>
                <div className="sub-card-header">
                  <div className="sub-info">
                    <div className="sub-icon spotify">S</div>
                    <span className="sub-name">Spotify Duo</span>
                  </div>
                </div>
                <div className="sub-details">
                  <span className="sub-detail-label">Tarif mensuel :</span>
                  <span className="sub-detail-value">3 500 FCFA</span>
                </div>
                <button 
                  className="btn-secondary-outline" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem', marginTop: '8px' }}
                  onClick={() => {
                    setSelectedCatalogOffer(catalogOffers[1]);
                    setNewSubUser('');
                    setNewSubPass('');
                    setActiveModal('catalog');
                  }}
                >
                  Découvrir & Lier
                </button>
              </div>

              <div className="sub-card" style={{ backgroundColor: '#ffffff' }}>
                <div className="sub-card-header">
                  <div className="sub-info">
                    <div className="sub-icon canalplus">C</div>
                    <span className="sub-name">Canal+ Access</span>
                  </div>
                </div>
                <div className="sub-details">
                  <span className="sub-detail-label">Tarif mensuel :</span>
                  <span className="sub-detail-value">10 000 FCFA</span>
                </div>
                <button 
                  className="btn-secondary-outline" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem', marginTop: '8px' }}
                  onClick={() => {
                    setSelectedCatalogOffer(catalogOffers[2]);
                    setNewSubUser('');
                    setNewSubPass('');
                    setActiveModal('catalog');
                  }}
                >
                  Découvrir & Lier
                </button>
              </div>
            </div>



          </section>

          {/* Right Column: Wallet Summary & Access to Centralized Vault */}
          <section className="dashboard-section">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Votre Portefeuille</h2>
            </div>

            {/* Solde Card with deposit/withdrawals access */}
            <div className="side-panel" style={{ padding: '24px', gap: '20px', marginBottom: '24px' }}>
              <div>
                <span className="balance-label">Solde Onyx</span>
                <div style={{ fontSize: '2rem', fontWeight: '950', color: '#000000', marginTop: '4px' }}>
                  {balance.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <button 
                  className="btn-primary-dark"
                  style={{ padding: '12px', fontWeight: '800' }}
                  onClick={() => { setWalletStep(1); setPaymentMethod(''); setActiveModal('wallet'); }}
                >
                  💳 Effectuer un Dépôt / Retrait
                </button>
              </div>
            </div>

            {/* 3. Le Widget du Curseur Budgétaire Intelligent */}
            <div className="side-panel" style={{ padding: '24px', gap: '16px', marginBottom: '24px', border: isBudgetExceeded ? '2px solid #d32f2f' : '1.5px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊 Contrôle Budgétaire Intelligent</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Ajustez votre plafond maximum mensuel de dépenses pour vos loisirs numériques.
                </p>
              </div>

              {/* Jauge / Slider */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>
                  <span>Plafond :</span>
                  <span style={{ color: isBudgetExceeded ? '#d32f2f' : '#2e7d32' }}>
                    {budgetLimit.toLocaleString('fr-FR')} FCFA / mois
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="5000" 
                  max="50000" 
                  step="1000"
                  value={budgetLimit}
                  onChange={handleSliderChange}
                  style={{ 
                    width: '100%', 
                    accentColor: isBudgetExceeded ? '#d32f2f' : '#000000', 
                    cursor: 'pointer' 
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>5 000 FCFA</span>
                  <span>50 000 FCFA</span>
                </div>
              </div>

              {/* Bar Usage Graph */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Cumul utilisé ({totalSubCost.toLocaleString('fr-FR')} FCFA) :</span>
                  <span>{Math.round((totalSubCost / budgetLimit) * 100)}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(100, (totalSubCost / budgetLimit) * 100)}%`, 
                      height: '100%', 
                      backgroundColor: isBudgetExceeded ? '#d32f2f' : '#000000',
                      transition: 'width 0.3s ease' 
                    }}
                  />
                </div>
              </div>

              {/* Alert System */}
              {isBudgetExceeded && (
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#ffebee', border: '1.5px solid #ffcdd2', color: '#c62828', fontSize: '0.78rem', fontWeight: '700', lineHeight: '1.4' }}>
                  ⚠️ BUDGET DÉPASSÉ !<br/>
                  Le coût cumulé ({totalSubCost.toLocaleString('fr-FR')} FCFA) excède votre plafond de {budgetLimit.toLocaleString('fr-FR')} FCFA.
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.74rem', fontWeight: '500', color: '#555' }}>
                    Conseil : Suspendez temporairement l'un de vos services actifs (ex: Netflix ou Canal+) en passant en "Mode Vacances" pour rééquilibrer votre balance.
                  </span>
                </div>
              )}
            </div>

            {/* 4. Le Module de Détection Assistée (Abonnements Fantômes) */}
            <div className="side-panel" style={{ padding: '24px', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '4px' }}>👻 Détecteur d'Abonnements « Fantômes »</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Avez-vous des abonnements souscrits ailleurs qui dorment ou se superposent ? Cochez-les pour l'analyse IA.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'netflix', label: 'Netflix (Ailleurs / Personnel)' },
                  { id: 'spotify', label: 'Spotify (Ailleurs / Personnel)' },
                  { id: 'canal', label: 'Canal+ (Ailleurs / Décodeur)' },
                  { id: 'disney', label: 'Disney+ (Ailleurs)' }
                ].map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={ghostChecked[opt.id] || false}
                      onChange={(e) => setGhostChecked(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#000000' }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <button 
                className="btn-secondary-outline"
                style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                onClick={() => {
                  const count = Object.values(ghostChecked).filter(Boolean).length;
                  if (count === 0) {
                    setGhostDetectedMessage("Veuillez cocher au moins un service pour lancer l'analyse.");
                  } else {
                    setGhostDetectedMessage(`💡 IA Onyx : En centralisant ces ${count} abonnement(s) "fantômes" sur Onyx, vous économisez en moyenne 48% par mois ! Vos identifiants seront stockés dans votre coffre-fort chiffré.`);
                  }
                }}
              >
                🔍 Lancer la Détection IA
              </button>

              {ghostDetectedMessage && (
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', fontSize: '0.75rem', fontWeight: '800', lineHeight: '1.3' }}>
                  {ghostDetectedMessage}
                </div>
              )}
            </div>

            {/* Centralized Vault Access */}
            <div className="side-panel" style={{ padding: '24px', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '6px' }}>🔒 Coffre-fort Chiffré</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Sécurisez vos informations d'accès, mots de passe et fichiers d'abonnements.
                </p>
              </div>
              <button 
                className="btn-primary-dark"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => setActiveModal('vault')}
              >
                Ouvrir le Coffre-fort
              </button>
            </div>

            {/* Solid black button below to open catalog search */}
            <div>
              <button 
                className="btn-primary-dark"
                style={{ 
                  width: '100%',
                  padding: '18px', 
                  fontSize: '1rem', 
                  fontWeight: '800', 
                  letterSpacing: '0.5px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onClick={() => {
                  setSelectedCatalogOffer(null);
                  setSearchTerm('');
                  setActiveModal('catalog');
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                }}
              >
                <span>➕</span> Explorer plus d'abonnements
              </button>
            </div>

          </section>

        </div>
      )}

      {/* Concierge View */}
      {currentView === 'concierge' && renderConciergeView()}

      {/* Exchange View */}
      {currentView === 'exchange' && renderExchangeView()}

        {/* ==========================================================
           MODALS CONTAINERS
           ========================================================== */}
        
        {/* Modal 1: Wallet Transaction (Dépôt / Retrait) */}
        {activeModal === 'wallet' && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '420px', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              {/* Étape 1 : Choisir le type d'opération */}
              {walletStep === 1 && (
                <>
                  <div className="modal-header">
                    <h3 className="panel-section-title">💼 Mon Solde Onyx</h3>
                    <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#606468', lineHeight: '1.4', margin: 0 }}>
                      Sélectionnez l'opération que vous souhaitez effectuer sur votre solde :
                    </p>
                    <button 
                      type="button"
                      className="btn-primary-dark"
                      style={{ padding: '14px', fontWeight: '800' }}
                      onClick={() => { setWalletMode('depot'); setWalletStep(2); }}
                    >
                      📥 Effectuer un Dépôt
                    </button>
                    <button 
                      type="button"
                      className="btn-secondary-outline"
                      style={{ padding: '14px', fontWeight: '800' }}
                      onClick={() => { setWalletMode('retrait'); setWalletStep(2); }}
                    >
                      📤 Effectuer un Retrait
                    </button>
                  </div>
                </>
              )}

              {/* Étape 2 : Choisir le moyen de paiement */}
              {walletStep === 2 && (
                <>
                  <div className="modal-header">
                    <h3 className="panel-section-title">
                      {walletMode === 'depot' ? '📥 Moyen de Dépôt' : '📤 Moyen de Retrait'}
                    </h3>
                    <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '0.82rem', color: '#606468', marginBottom: '4px' }}>
                      Sélectionnez un moyen de paiement :
                    </p>
                    
                    {/* Option Wave active */}
                    <div 
                      onClick={() => { setPaymentMethod('wave'); setWalletStep(3); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '2px solid #111110',
                        backgroundColor: '#f5faff',
                        cursor: 'pointer',
                        fontWeight: '800',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.25rem' }}>🌊</span>
                        <span>Wave Mobile Money</span>
                      </div>
                      <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: '700' }}>Actif</span>
                    </div>

                    {/* Option Orange Money (Bientôt) */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: '#fcfcfb',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8c8c88' }}>
                        <span style={{ fontSize: '1.25rem' }}>🍊</span>
                        <span>Orange Money</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#e65100', fontWeight: '700', backgroundColor: '#fff3e0', padding: '4px 8px', borderRadius: '12px' }}>Bientôt</span>
                    </div>

                    {/* Option Free Money (Bientôt) */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: '#fcfcfb',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8c8c88' }}>
                        <span style={{ fontSize: '1.25rem' }}>🔴</span>
                        <span>Free Money</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#c62828', fontWeight: '700', backgroundColor: '#ffebee', padding: '4px 8px', borderRadius: '12px' }}>Bientôt</span>
                    </div>

                    {/* Option MTN MoMo (Bientôt) */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: '#fcfcfb',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8c8c88' }}>
                        <span style={{ fontSize: '1.25rem' }}>🟨</span>
                        <span>MTN MoMo</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#f57f17', fontWeight: '700', backgroundColor: '#fffde7', padding: '4px 8px', borderRadius: '12px' }}>Bientôt</span>
                    </div>

                    {/* Option Carte Bancaire (Bientôt) */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: '#fcfcfb',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8c8c88' }}>
                        <span style={{ fontSize: '1.25rem' }}>💳</span>
                        <span>Carte Bancaire</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#37474f', fontWeight: '700', backgroundColor: '#eceff1', padding: '4px 8px', borderRadius: '12px' }}>Bientôt</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-secondary-outline" 
                    style={{ marginTop: '16px', width: '100%', padding: '10px' }}
                    onClick={() => setWalletStep(1)}
                  >
                    Retour
                  </button>
                </>
              )}

              {/* Étape 3 : Saisir le montant */}
              {walletStep === 3 && (
                <form onSubmit={handleWalletTransaction}>
                  <div className="modal-header">
                    <h3 className="panel-section-title">
                      {walletMode === 'depot' ? '💳 Recharge Wave' : '💸 Retrait Wave'}
                    </h3>
                    <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
                  </div>

                  <div className="form-group-select" style={{ marginTop: '14px' }}>
                    <label className="onboarding-label">Montant à {walletMode === 'depot' ? 'déposer' : 'retirer'} (FCFA)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 5000" 
                      className="onboarding-input"
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      className="btn-secondary-outline" 
                      style={{ padding: '12px' }}
                      onClick={() => setWalletStep(2)}
                    >
                      Retour
                    </button>
                    <button type="submit" className="btn-primary-dark" style={{ padding: '12px' }}>
                      Confirmer
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

        {/* Modal 2: Centralized Subscription Management Pop-up */}
        {activeModal === 'sub-manage' && selectedSub && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3 className="panel-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`sub-icon ${selectedSub.typeClass}`} style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                    {selectedSub.logoLetter}
                  </div>
                  Gestion de l'abonnement {selectedSub.name}
                </h3>
                <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                
                {/* Vacation Mode Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1.5px solid var(--border-color)', borderRadius: '14px', backgroundColor: '#fcfcfb' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Mode Vacances</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Désactive les paiements temporairement</div>
                  </div>
                  <button 
                    className={`action-btn ${selectedSub.isVacationMode ? 'active' : ''}`}
                    onClick={() => handleToggleVacation(selectedSub.id)}
                    style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                  >
                    {selectedSub.isVacationMode ? 'Actif' : 'Inactif'}
                  </button>
                </div>

                {/* Smart Swapping Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1.5px solid var(--border-color)', borderRadius: '14px', backgroundColor: '#fcfcfb' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Smart Swapping</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Échange automatique avec la communauté</div>
                  </div>
                  <button 
                    className={`action-btn ${selectedSub.isSmartSwapping ? 'active' : ''}`}
                    onClick={() => handleToggleSmartSwapping(selectedSub.id)}
                    style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                  >
                    {selectedSub.isSmartSwapping ? 'Actif' : 'Inactif'}
                  </button>
                </div>

              </div>

              {/* Secure Credentials Vault Section */}
              <div style={{ border: '1.5px solid var(--border-color)', borderRadius: '14px', padding: '16px', marginTop: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  🔑 Accès du profil (Chiffrement AES-256)
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>IDENTIFIANT</label>
                    <input 
                      type="text" 
                      value={selectedSub.usernameField}
                      className="onboarding-input"
                      style={{ padding: '10px', fontSize: '0.85rem', marginTop: '4px' }}
                      onChange={(e) => handleUpdateSubCredentials(selectedSub.id, e.target.value, selectedSub.passwordField)}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>MOT DE PASSE</label>
                    <input 
                      type={showSubPass ? 'text' : 'password'} 
                      value={selectedSub.passwordField}
                      className="onboarding-input"
                      style={{ padding: '10px', fontSize: '0.85rem', marginTop: '4px', paddingRight: '40px' }}
                      onChange={(e) => handleUpdateSubCredentials(selectedSub.id, selectedSub.usernameField, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSubPass(!showSubPass)}
                      style={{ position: 'absolute', right: '12px', bottom: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>

              {/* Billing details and deletion */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Prélèvement Onyx : <strong>{selectedSub.price.toLocaleString('fr-FR')} FCFA / mois</strong>
                </span>
                <button 
                  className="action-btn" 
                  style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)', fontSize: '0.8rem' }}
                  onClick={() => handleDeleteSub(selectedSub.id)}
                >
                  Supprimer l'abonnement
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 3: Profile Information (Mes Infos) */}
        {activeModal === 'profile-info' && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h3 className="panel-section-title">👤 Paramètres & Profil Utilisateur</h3>
                <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                
                {/* PHOTO DE PROFIL UPLOAD */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                  <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setIsAvatarZoomed(true)} title="Cliquer pour agrandir la photo">
                    <img 
                      src={tempAvatar || userAvatar || DEFAULT_AVATAR} 
                      alt="Profil" 
                      style={{ width: '95px', height: '95px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #000000', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                    />
                    <span style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#000', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      🔍
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#8c8c88' }}>Cliquer sur l'image pour l'agrandir</span>
                  
                  {tempAvatar ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2e7d32' }}>Enregistrer cette photo ?</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          type="button"
                          onClick={() => {
                            setUserAvatar(tempAvatar);
                            localStorage.setItem('onyx_user_avatar', tempAvatar);
                            setTempAvatar('');
                            alert('Photo de profil enregistrée avec succès.');
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#ffffff',
                            backgroundColor: '#2e7d32',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(46, 125, 50, 0.2)'
                          }}
                        >
                          ✅ Enregistrer
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setTempAvatar('');
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#d32f2f',
                            backgroundColor: 'transparent',
                            border: '1.5px solid #d32f2f',
                            borderRadius: '20px',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 16px', 
                      fontSize: '0.85rem', 
                      fontWeight: '700', 
                      color: '#ffffff', 
                      backgroundColor: '#111110', 
                      borderRadius: '24px', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      border: '1.5px solid #111110', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      marginTop: '4px'
                    }}>
                      📷 Importer une image
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  )}
                </div>
                {/* PART 1: IDENTITÉ */}
                <div style={{ border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', backgroundColor: '#fcfcfb' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📝 Coordonnées Personnelles
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="onboarding-form-group">
                      <label className="onboarding-label">Nom complet</label>
                      <input 
                        type="text" 
                        className="onboarding-input" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="onboarding-form-group">
                      <label className="onboarding-label">Adresse E-mail</label>
                      <input 
                        type="email" 
                        className="onboarding-input" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="onboarding-form-group">
                      <label className="onboarding-label">Téléphone Wave lié</label>
                      <input 
                        type="text" 
                        className="onboarding-input" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group-select">
                      <label className="onboarding-label">Pays de facturation</label>
                      <select 
                        className="select-input"
                        value={userCountry}
                        onChange={(e) => setUserCountry(e.target.value)}
                      >
                        <option value="Sénégal">Sénégal (FCFA)</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire (FCFA)</option>
                        <option value="Mali">Mali (FCFA)</option>
                        <option value="Togo">Togo (FCFA)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PART 2: NOTIFICATIONS PREFERENCES */}
                <div style={{ border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', backgroundColor: '#ffffff' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🔔 Préférences d'Alertes
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={prefSms}
                        onChange={(e) => setPrefSms(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#000000' }}
                      />
                      Recevoir les rappels de débit par SMS
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={prefWhatsapp}
                        onChange={(e) => setPrefWhatsapp(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#000000' }}
                      />
                      Recevoir le suivi des transactions par WhatsApp
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={prefEmail}
                        onChange={(e) => setPrefEmail(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#000000' }}
                      />
                      Recevoir le rapport financier mensuel par e-mail
                    </label>
                  </div>
                </div>

                {/* PART 3: SECURITE */}
                <div style={{ border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', backgroundColor: '#fcfcfb' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🔒 Sécurité & Mot de passe
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="onboarding-form-group">
                      <label className="onboarding-label">Ancien mot de passe</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="onboarding-input" 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </div>

                    <div className="onboarding-form-group">
                      <label className="onboarding-label">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="onboarding-input" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="onboarding-form-group">
                      <label className="onboarding-label">Confirmer le nouveau mot de passe</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="onboarding-input" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '4px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary-outline"
                    onClick={() => setActiveModal('none')}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary-dark">
                    Enregistrer les modifications
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Centralized Coffre-fort (Budget & Security Command Center) */}
        {activeModal === 'vault' && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <h3 className="panel-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔒 Coffre-fort Budgétaire & Sécurité</span>
                </h3>
                <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0', lineHeight: '1.4' }}>
                Le centre de contrôle chiffré de votre budget, vos limites de paiements Wave et la sécurité de vos identifiants d'abonnements.
              </p>

              {/* SECTION A: LIMITES & PREVISIONS BUDGETAIRES */}
              <div style={{ border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', marginBottom: '16px', backgroundColor: '#fcfcfb' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📊 Configuration Budgétaire
                </h4>

                <div className="budget-widget">
                  <div className="budget-header">
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Plafond budgétaire</span>
                    <span className={`budget-limit-display ${isBudgetExceeded ? 'warning' : ''}`}>
                      {budgetLimit.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="500" 
                      max="25000" 
                      step="500"
                      value={budgetLimit} 
                      onChange={handleSliderChange}
                      className={`slider ${isBudgetExceeded ? 'limit-reached' : ''}`}
                    />
                    <div className="slider-labels">
                      <span>500</span>
                      <span>25 000</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider" style={{ margin: '14px 0' }}></div>

                {/* Forecast summary sheet */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Solde Actuel :</span>
                    <span style={{ fontWeight: '800' }}>{balance.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Coût mensuel actif :</span>
                    <span style={{ fontWeight: '800', color: isBudgetExceeded ? 'var(--error-color)' : '#000000' }}>
                      -{totalSubCost.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px dashed #e5e5e0', paddingTop: '6px', marginTop: '2px' }}>
                    <span style={{ fontWeight: '700' }}>Solde Prévisionnel :</span>
                    <span style={{ fontWeight: '900', color: (balance - totalSubCost) < 0 ? 'var(--error-color)' : 'var(--success-color)' }}>
                      {(balance - totalSubCost).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION B: SECURE CREDENTIALS LIST */}
              <div style={{ border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', backgroundColor: '#ffffff' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔑 Identifiants & Comptes liés (AES-256)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {subs.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                      Aucun identifiant actif à sécuriser.
                    </div>
                  ) : (
                    subs.map(sub => (
                      <div key={sub.id} style={{ padding: '10px', border: '1px solid #e5e5e0', borderRadius: '10px', backgroundColor: '#fcfcfb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>{sub.name}</span>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                            onClick={() => {
                              setSelectedSub(sub);
                              setActiveModal('sub-manage');
                            }}
                          >
                            Éditer
                          </button>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          ID : {sub.usernameField}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button 
                type="button" 
                className="btn-primary-dark" 
                style={{ marginTop: '16px', width: '100%' }}
                onClick={() => setActiveModal('none')}
              >
                Fermer le Coffre-fort
              </button>
            </div>
          </div>
        )}

        {/* Modal 5: Premium Account (Offre Premium) */}
        {activeModal === 'premium' && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '750px', width: '90%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Header */}
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <span>⭐ Les Formules d'Offres Onyx</span>
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Statut actuel : <strong style={{ color: isUserPremium ? '#e65100' : '#111110' }}>{isUserPremium ? 'Membre Premium Actif' : 'Formule Gratuite'}</strong>
                  </span>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
              </div>

              {/* 1. Le Sélecteur d'Offre (Toggle ou Onglets) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', backgroundColor: '#f5f5f5', padding: '4px', borderRadius: '30px', border: '1.5px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setPremiumActiveTab('gratuit')}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '25px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: premiumActiveTab === 'gratuit' ? '#ffffff' : 'transparent',
                      color: premiumActiveTab === 'gratuit' ? '#111110' : '#8c8c88',
                      boxShadow: premiumActiveTab === 'gratuit' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Offre Gratuite
                  </button>
                  <button
                    type="button"
                    onClick={() => setPremiumActiveTab('premium')}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '25px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: premiumActiveTab === 'premium' ? '#ffd000' : 'transparent',
                      color: '#000000',
                      boxShadow: premiumActiveTab === 'premium' ? '0 2px 8px rgba(255, 208, 0, 0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Offre Premium ⭐
                  </button>
                </div>
              </div>

              {/* 2. La Grille Comparative des Fonctionnalités */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                
                {/* Card Offre Gratuite */}
                <div style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1.5px solid var(--border-color)', 
                  backgroundColor: '#ffffff',
                  opacity: isUserPremium ? 0.5 : 1,
                  filter: isUserPremium ? 'grayscale(30%)' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  {isUserPremium && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', fontWeight: '800', color: '#888' }}>
                      Second plan
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: '900', color: '#888' }}>Offre Gratuite</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: '950', color: '#111110', marginBottom: '16px' }}>0 FCFA <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#888' }}>/ à vie</span></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#555' }}>Centralisation & Suivi</strong>
                      <span>Rapide et manuel (l'utilisateur liste ses comptes).</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#555' }}>Alertes Échéances</strong>
                      <span>Alertes push basiques avant les prélèvements.</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#555' }}>Recharges & Flux</strong>
                      <span>1% de frais de transaction sur chaque recharge Wave.</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#555' }}>Devises (€ / $)</strong>
                      <span>Taux avec marge commerciale (arrondi supérieur).</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#555' }}>Support / Conciergerie</strong>
                      <span>Chat textuel standard (réponse sous 48h).</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#555' }}>Gestion Active</strong>
                      <span>Indisponible (gestion manuelle requise).</span>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#555' }}>Bourse d'Échange</strong>
                      <span>Accès standard au marché communautaire.</span>
                    </div>
                  </div>
                </div>

                {/* Card Offre Premium */}
                <div 
                  className={!isUserPremium ? "shake-card" : ""}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px', 
                    border: isUserPremium ? '2px solid #ffd000' : '1.5px solid var(--border-color)', 
                    backgroundColor: isUserPremium ? '#fffae6' : '#ffffff',
                    boxShadow: isUserPremium ? '0 8px 32px rgba(255, 208, 0, 0.15)' : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {!isUserPremium && (
                    <div style={{ position: 'absolute', top: '-10px', right: '16px', backgroundColor: '#ffd000', color: '#000000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      POPULAIRE 🔥
                    </div>
                  )}
                  {isUserPremium && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', backgroundColor: '#2e7d32', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                      ✓ ACTIF
                    </div>
                  )}
                  
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: '900', color: '#e65100' }}>Offre Premium</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: '950', color: '#000000', marginBottom: '16px' }}>2 900 FCFA <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#888' }}>/ mois</span></div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#e65100' }}>Centralisation & Suivi</strong>
                      <span>Automatisé via le Coffre-fort chiffré.</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#e65100' }}>Alertes Échéances</strong>
                      <span>Alertes prédictives avec blocage budgétaire automatique.</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#e65100' }}>Recharges & Flux</strong>
                      <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>0% de frais (Totalement gratuit).</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#e65100' }}>Devises (€ / $)</strong>
                      <span>Taux interbancaire réel (aucune marge d'Onyx).</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#e65100' }}>Support / Conciergerie</strong>
                      <span>Ligne prioritaire (SLA &lt; 24h) + Appel planifié.</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                      <strong style={{ display: 'block', color: '#e65100' }}>Gestion Active</strong>
                      <span>Mode Vacances (suspension) & Smart Swapping gérés par l'équipe.</span>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: '#e65100' }}>Bourse d'Échange</strong>
                      <span>Garantie Onyx active (profil de secours sous 24h).</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. L'Écran Dynamique selon le Statut de l'Utilisateur */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                
                {!isUserPremium ? (
                  /* Formule Gratuit */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 'bold' }}>
                      📈 Simulation d'économies : En passant Premium, vous économiseriez en moyenne 12 000 FCFA ce mois-ci (frais de rechargement Wave et marges devises à 0%).
                    </div>
                    <button
                      type="button"
                      className="btn-primary-dark"
                      style={{ 
                        backgroundColor: '#ffd000', 
                        color: '#000000', 
                        border: 'none', 
                        padding: '16px 40px', 
                        fontSize: '1rem', 
                        fontWeight: '900',
                        boxShadow: '0 4px 14px rgba(255, 208, 0, 0.4)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        localStorage.setItem('onyx_is_premium', 'true');
                        setIsUserPremium(true);
                        setPremiumActiveTab('premium');
                        alert('Félicitations ! Vous êtes désormais Membre Premium Onyx. Tous vos frais de recharge sont maintenant de 0% !');
                      }}
                    >
                      🚀 Passer à l'Offre Premium
                    </button>
                  </div>
                ) : (
                  /* Formule Premium Actif */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: '#2e7d32' }}>
                      ✓ Membre Premium Onyx - Actif ⭐
                    </div>
                    <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-secondary-outline"
                        style={{ padding: '12px 24px', fontSize: '0.85rem', fontWeight: '800' }}
                        onClick={() => {
                          if (confirm('Voulez-vous repasser en formule Gratuite pour tester ?')) {
                            localStorage.setItem('onyx_is_premium', 'false');
                            setIsUserPremium(false);
                            setPremiumActiveTab('gratuit');
                            alert('Abonnement repassé en version Gratuite.');
                          }
                        }}
                      >
                        ⚙️ Gérer mon abonnement (Downgrade)
                      </button>
                      
                      <button
                        type="button"
                        className="btn-primary-dark"
                        style={{ padding: '12px 24px', fontSize: '0.85rem', fontWeight: '800' }}
                        onClick={() => alert('Appel avec votre conseiller Onyx dédié en cours de planification...')}
                      >
                        📞 Contacter mon Conseiller Dédié
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* Modal 6: Search Catalog & Subscription Link Modal (Plus d'abonnements) */}
        {activeModal === 'catalog' && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <h3 className="panel-section-title">
                  {isMakingSuggestion 
                    ? "💡 Suggérer un nouvel abonnement"
                    : selectedCatalogOffer 
                      ? `🔗 Lier un compte ${selectedCatalogOffer.name}` 
                      : "🛍️ Catalogue des abonnements"
                  }
                </h3>
                <button type="button" className="modal-close-btn" onClick={() => { setActiveModal('none'); setIsMakingSuggestion(false); }}>×</button>
              </div>

              {/* VIEW A: Suggestion Form */}
              {isMakingSuggestion ? (
                <form onSubmit={handleSendSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Proposez un nouveau service d'abonnement que vous souhaitez gérer sur Onyx. Nous étudierons son intégration avec priorité.
                  </p>

                  <div className="onboarding-form-group">
                    <label className="onboarding-label">Nom du service d'abonnement</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Crunchyroll, Duolingo, Le Monde..." 
                      className="onboarding-input"
                      value={suggestedName}
                      onChange={(e) => setSuggestedName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="onboarding-form-group">
                    <label className="onboarding-label">Tarif mensuel estimé (FCFA - Optionnel)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 3500" 
                      className="onboarding-input"
                      value={suggestedPrice}
                      onChange={(e) => setSuggestedPrice(e.target.value)}
                    />
                  </div>

                  <div className="onboarding-form-group">
                    <label className="onboarding-label">Remarques ou détails additionnels</label>
                    <textarea 
                      placeholder="Ex: Formule étudiante, ou abonnement annuel..." 
                      className="onboarding-input"
                      style={{ minHeight: '80px', borderRadius: '14px', resize: 'vertical', padding: '12px' }}
                      value={suggestedComments}
                      onChange={(e) => setSuggestedComments(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      className="btn-secondary-outline"
                      onClick={() => setIsMakingSuggestion(false)}
                    >
                      Retour
                    </button>
                    <button type="submit" className="btn-primary-dark">
                      Envoyer ma suggestion
                    </button>
                  </div>
                </form>
              ) : !selectedCatalogOffer ? (
                /* VIEW B: Search & Filter Offer Catalog */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Recherchez parmi notre large catalogue de services pour ajouter un nouvel abonnement dans votre espace.
                  </p>

                  <input 
                    type="text"
                    placeholder="🔍 Rechercher un abonnement..."
                    className="onboarding-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* Matches List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredOffers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Aucun résultat correspondant à votre recherche.
                      </div>
                    ) : (
                      filteredOffers.map(offer => (
                        <div 
                          key={offer.name}
                          onClick={() => {
                            setSelectedCatalogOffer(offer);
                            setNewSubUser('');
                            setNewSubPass('');
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 16px',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#ffffff',
                            transition: 'var(--transition-smooth)'
                          }}
                          className="profile-menu-item"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className={`sub-icon ${offer.typeClass}`} style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                              {offer.logoLetter}
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{offer.name}</span>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
                            {offer.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Suggestion section at the bottom */}
                  <div style={{
                    marginTop: '8px',
                    padding: '14px',
                    border: '1.5px dashed var(--border-color)',
                    borderRadius: '16px',
                    backgroundColor: '#fcfcfb',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                      Le service que vous cherchez n'existe pas encore ?
                    </span>
                    <button 
                      type="button"
                      className="btn-secondary-outline"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', alignSelf: 'center' }}
                      onClick={() => setIsMakingSuggestion(true)}
                    >
                      Faire une suggestion
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW C: Fill credentials and subscribe */
                <form onSubmit={handleCreateNewSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #ffd000', borderRadius: '12px', backgroundColor: '#fffae6' }}>
                    <div className={`sub-icon ${selectedCatalogOffer.typeClass}`} style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                      {selectedCatalogOffer.logoLetter}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{selectedCatalogOffer.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Facturation Onyx : {selectedCatalogOffer.price.toLocaleString('fr-FR')} FCFA / mois
                      </div>
                    </div>
                  </div>

                  {/* Input Username */}
                  <div className="onboarding-form-group">
                    <label className="onboarding-label">Identifiant de connexion (E-mail / Compte)</label>
                    <input 
                      type="email" 
                      placeholder="exemple@mail.com" 
                      className="onboarding-input"
                      value={newSubUser}
                      onChange={(e) => setNewSubUser(e.target.value)}
                      required
                    />
                  </div>

                  {/* Input Password */}
                  <div className="onboarding-form-group">
                    <label className="onboarding-label">Mot de passe du compte</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="onboarding-input"
                      value={newSubPass}
                      onChange={(e) => setNewSubPass(e.target.value)}
                      required
                    />
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    🔒 Vos accès de connexion seront chiffrés et gérés de manière sécurisée dans votre Coffre-fort Onyx.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      className="btn-secondary-outline"
                      onClick={() => setSelectedCatalogOffer(null)}
                    >
                      Retour
                    </button>
                    <button type="submit" className="btn-primary-dark">
                      Lier mon abonnement
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        )}

        {/* Fullscreen Avatar Lightbox */}
        {isAvatarZoomed && (
          <div className="modal-overlay" style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={() => setIsAvatarZoomed(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }} onClick={e => e.stopPropagation()}>
              <img 
                src={tempAvatar || userAvatar || DEFAULT_AVATAR} 
                alt="Aperçu Agrandi" 
                style={{ width: '280px', height: '280px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffffff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              />
              <button 
                type="button"
                onClick={() => setIsAvatarZoomed(false)}
                style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '24px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal: Planifier un appel */}
        {activeModal === 'plan-call' && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="panel-section-title">Planifier un appel</h3>
                <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Choisissez un créneau horaire :
              </p>

              <div className="booking-slots-grid">
                {timeSlots.map(slot => (
                  <button 
                    key={slot}
                    type="button"
                    className={`booking-slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <button 
                type="button" 
                className="btn-primary-dark"
                style={{ marginTop: '12px' }}
                onClick={handlePlanCall}
              >
                Confirmer le créneau
              </button>
            </div>
          </div>
        )}

        {/* Modal: Proposer une place d'Abonnement */}
        {activeModal === 'propose-exchange' && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3 className="panel-section-title">📢 Proposer un profil de partage</h3>
                <button type="button" className="modal-close-btn" onClick={() => setActiveModal('none')}>×</button>
              </div>
              
              <form onSubmit={handleProposeExchange} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label className="onboarding-label">Service que vous offrez</label>
                  <select 
                    className="select-input" 
                    value={offeredSubInput}
                    onChange={(e) => setOfferedSubInput(e.target.value)}
                  >
                    <option value="Netflix">Netflix Premium (🎥)</option>
                    <option value="Spotify">Spotify Premium (🎵)</option>
                    <option value="Canal+">Canal+ Escale (📺)</option>
                    <option value="Crunchyroll">Crunchyroll Fan (🍿)</option>
                  </select>
                </div>

                <div>
                  <label className="onboarding-label">Service recherché en échange</label>
                  <select 
                    className="select-input" 
                    value={wantedSubInput}
                    onChange={(e) => setWantedSubInput(e.target.value)}
                  >
                    <option value="Spotify">Spotify Premium (🎵)</option>
                    <option value="Netflix">Netflix Premium (🎥)</option>
                    <option value="Canal+">Canal+ Escale (📺)</option>
                    <option value="Crunchyroll">Crunchyroll Fan (🍿)</option>
                    <option value="Disney+">Disney+ (🎬)</option>
                  </select>
                </div>

                <div>
                  <label className="onboarding-label">Nombre d'écrans / profils partagés</label>
                  <select 
                    className="select-input"
                    value={proposeScreens}
                    onChange={(e) => setProposeScreens(Number(e.target.value))}
                  >
                    <option value={1}>1 profil / écran</option>
                    <option value={2}>2 profils / écrans</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                  <input 
                    type="checkbox" 
                    id="storePayoutCheck"
                    checked={proposeStorePayout}
                    onChange={(e) => setProposeStorePayout(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="storePayoutCheck" style={{ fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    Échanger contre un solde Onyx (Alternative financière)
                  </label>
                </div>

                {proposeStorePayout && (
                  <div>
                    <label className="onboarding-label">Coût mensuel souhaité (FCFA)</label>
                    <input 
                      type="number"
                      placeholder="Ex: 1500"
                      className="onboarding-input"
                      value={proposeCost}
                      onChange={(e) => setProposeCost(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="onboarding-label">Identifiants et Clé d'Accès Chiffrée (Coffre-fort)</label>
                  <textarea 
                    className="onboarding-input"
                    placeholder="Ex: Identifiant: netflix@mail.com / MDP: secret123 (Ces données ne seront visibles que par le co-abonné ayant validé l'échange)"
                    style={{ minHeight: '80px', padding: '10px', fontSize: '0.85rem' }}
                    value={proposeAccessDetails}
                    onChange={(e) => setProposeAccessDetails(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary-dark" style={{ marginTop: '6px' }}>
                  Publier l'Offre
                </button>

              </form>
            </div>
          </div>
        )}

        {/* Modal: Safety Litige & Secours */}
        {isLitigeOpen && litigeTarget && (
          <div className="modal-overlay" style={{ zIndex: 1200 }}>
            <div className="modal-content" style={{ maxWidth: '460px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#c62828', marginBottom: '8px' }}>Déclencher la Garantie Onyx ?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                Vous vous apprêtez à signaler un accès bloqué sur le partage de <strong>{litigeTarget.owner}</strong> ({litigeTarget.service || litigeTarget.offeredSub}). <br/><br/>
                Cette action va geler le transfert financier, infliger un malus de -30 points de confiance au propriétaire, et vous basculer sur un profil de secours temporaire fourni par Onyx (SLA 24h).
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn-secondary-outline" 
                  onClick={() => { setIsLitigeOpen(false); setLitigeTarget(null); }}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn-primary-dark"
                  style={{ backgroundColor: '#c62828', color: '#ffffff', border: '1.5px solid #c62828' }} 
                  onClick={handleConfirmLitige}
                >
                  Confirmer le litige
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Toast Notification Container */}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          {/* Render inactivity warning countdown toast */}
          {logoutCountdown !== null && (
            <div style={{
              background: '#1e1b4b',
              color: '#f43f5e',
              border: '1.5px solid #f43f5e',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(244, 63, 94, 0.25)',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              pointerEvents: 'auto',
              animation: 'pulse 1.5s infinite'
            }}>
              <span>⏰</span>
              <div>
                <div>Session inactive. Déconnexion imminente !</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
                  Déconnexion automatique dans <span style={{ color: '#f43f5e', fontWeight: 800 }}>{logoutCountdown} secondes</span>.
                </div>
              </div>
            </div>
          )}

          {/* Render standard notification toasts */}
          {toasts.map(toast => (
            <div key={toast.id} style={{
              background: toast.type === 'success' ? '#064e3b' : toast.type === 'warning' ? '#78350f' : '#1e293b',
              color: toast.type === 'success' ? '#34d399' : toast.type === 'warning' ? '#fbbf24' : '#e2e8f0',
              border: `1.5px solid ${toast.type === 'success' ? '#059669' : toast.type === 'warning' ? '#d97706' : '#475569'}`,
              padding: '12px 18px',
              borderRadius: '10px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto',
              minWidth: '240px',
              animation: 'slideIn 0.25s ease-out'
            }}>
              <span>
                {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
