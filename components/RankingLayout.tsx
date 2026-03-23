'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { signOut } from 'next-auth/react';

interface Props {
  title?: string;
  headerCenter?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  onMenu?: () => void;
  onUser?: () => void;
  userEmail?: string;
  userRole?: 'admin' | 'user';
  children: React.ReactNode;
  isAdmin: boolean;
}

export default function RankingLayout({
  title,
  headerCenter,
  headerLeft,
  headerRight,
  onMenu,
  onUser,
  userEmail,
  userRole = 'user',
  children,
  isAdmin
}: Props) {
  return <div className="space-y-4">{children}</div>;
}
