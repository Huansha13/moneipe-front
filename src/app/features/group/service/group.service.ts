import { Injectable, signal, computed } from '@angular/core';


export interface Group {
  id: number;
  title: string;
  description: string;
  role: 'ADMIN' | 'MIEMBRO';
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly groupsSignal = signal<Group[]>([
    {
      id: 1,
      title: 'Familia',
      description: 'Grupo para compartir gastos y actividades familiares',
      role: 'ADMIN'
    },
    {
      id: 2,
      title: 'Amigos de la Universidad',
      description: 'Grupo de amigos para organizar actividades y gastos compartidos',
      role: 'MIEMBRO'
    },
    {
      id: 3,
      title: 'Equipo de Trabajo',
      description: 'Grupo para coordinar actividades y gastos del equipo',
      role: 'MIEMBRO'
    },
    {
      id: 4,
      title: 'Amigos del Colegio',
      description: 'Grupo de amigos para organizar reuniones y actividades',
      role: 'MIEMBRO'
    },
    {
      id: 5,
      title: 'Club de Lectura',
      description: 'Grupo para compartir libros y organizar reuniones de lectura',
      role: 'MIEMBRO'
    }
  ]);
  // Estado privado con los datos iniciales

  // Signal pública de solo lectura para la lista
  groups = this.groupsSignal.asReadonly();

  // Signal reactiva para obtener el total automáticamente
  groupCount = computed(() => this.groupsSignal().length);

  // Método para actualizar o simular carga de grupos
  setGroups(newGroups: Group[]) {
    this.groupsSignal.set(newGroups);
  }

  // Método opcional para agregar un grupo dinámicamente
  addGroup(group: Group) {
    this.groupsSignal.update(current => [...current, group]);
  }
}
