/**
 * Security & Exam Mode Proctoring Service
 * Enforces Kiosk-like integrity using Page Visibility API, Fullscreen API,
 * Window blur detection, and shortcut prevention.
 */

import { ViolationType, ViolationLog } from '../types';

export class SecurityService {
  /**
   * Request browser fullscreen
   */
  static async requestFullscreen(element: HTMLElement = document.documentElement): Promise<boolean> {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return true;
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
        return true;
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
      return false;
    }
  }

  /**
   * Check if document is currently fullscreen
   */
  static isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  /**
   * Exit fullscreen safely
   */
  static async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen && this.isFullscreen()) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    } catch (err) {
      // Ignore exit errors
    }
  }

  /**
   * Formats current time in WIB (Waktu Indonesia Barat)
   */
  static getWIBTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} WIB`;
  }

  /**
   * Helper to construct a ViolationLog record
   */
  static createViolationLog(
    type: ViolationType,
    violationNumber: number,
    customDetail?: string
  ): ViolationLog {
    const timestamp = this.getWIBTimestamp();
    let typeName = 'Pelanggaran Integritas';
    let details = customDetail || 'Aktivitas tidak diizinkan terdeteksi.';

    switch (type) {
      case 'exit_fullscreen':
        typeName = 'Keluar Layar Penuh (Exit Fullscreen)';
        details = customDetail || 'Siswa menekan tombol keluar fullscreen atau mengubah ukuran jendela peramban.';
        break;
      case 'tab_switch':
        typeName = 'Berpindah Tab / Browser (Tab Switch)';
        details = customDetail || 'Halaman ujian diminimalkan atau siswa beralih ke tab browser lain.';
        break;
      case 'window_blur':
        typeName = 'Kehilangan Fokus Jendela (Window Blur)';
        details = customDetail || 'Fokus jendela ujian berpindah ke aplikasi latar belakang atau bilah tugas (Alt+Tab).';
        break;
      case 'forbidden_key':
        typeName = 'Tombol Pintas Terlarang (Shortcut Attempt)';
        details = customDetail || 'Percobaan shortcut keyboard yang dilarang (Ctrl+C, Ctrl+V, F12, dsb).';
        break;
      case 'context_menu':
        typeName = 'Klik Kanan Terlarang';
        details = customDetail || 'Membuka menu konteks atau inspeksi elemen.';
        break;
    }

    return {
      id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      type,
      typeName,
      details,
      violationNumber,
    };
  }

  /**
   * Check supervisor PIN
   */
  static verifySupervisorPin(inputPin: string, expectedPin: string = '8899'): boolean {
    return inputPin.trim() === expectedPin.trim();
  }
}
