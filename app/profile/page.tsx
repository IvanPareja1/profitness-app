
// Original code:
// ...

// Replace "// ... existing code ..." markers
// ...

      // Crear backup completo antes de cerrar sesión
      const backupData = {
        userData: JSON.parse(localStorage.getItem('userData') || '{}'),
        userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
        userProfilePhoto: localStorage.getItem('userProfilePhoto'),
        nutritionData: {} as { [key: string]: string | null },
        restDaySettings: localStorage.getItem('restDaySettings'),
        hydrationReminder: localStorage.getItem('hydrationReminder'),
        healthData: localStorage.getItem('healthData'),
        lastLogin: new Date().toISOString()
      };

// ...

// Rest of the original code remains the same
// ...
