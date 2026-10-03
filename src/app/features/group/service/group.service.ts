import { Injectable, signal, computed } from '@angular/core';

export interface GroupMember {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MIEMBRO';
}

export interface Group {
  id: number;
  title: string;
  description: string;
  role: 'ADMIN' | 'MIEMBRO';
  members: GroupMember[];
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
      role: 'ADMIN',
      members: [
        {id: 11, name: 'Ana Torres', email: 'ana.torres@moneipe.com', role: 'ADMIN'},
        {id: 12, name: 'Luis Torres', email: 'luis.torres@moneipe.com', role: 'MIEMBRO'},
        {id: 13, name: 'María Torres', email: 'maria.torres@moneipe.com', role: 'MIEMBRO'},
        {id: 14, name: 'Carlos Pérez', email: 'carlos.perez@moneipe.com', role: 'MIEMBRO'}
      ]
    },
    {
      id: 2,
      title: 'Amigos de la Universidad',
      description: 'Grupo de amigos para organizar actividades y gastos compartidos',
      role: 'MIEMBRO',
      members: [
        {id: 21, name: 'Sofía Ramírez', email: 'sofia.ramirez@moneipe.com', role: 'ADMIN'},
        {id: 22, name: 'Diego Herrera', email: 'diego.herrera@moneipe.com', role: 'MIEMBRO'},
        {id: 23, name: 'Valeria Cruz', email: 'valeria.cruz@moneipe.com', role: 'MIEMBRO'},
        {id: 24, name: 'Javier Mendoza', email: 'javier.mendoza@moneipe.com', role: 'MIEMBRO'},
        {id: 25, name: 'Camila Ortiz', email: 'camila.ortiz@moneipe.com', role: 'MIEMBRO'}
      ]
    },
    {
      id: 3,
      title: 'Equipo de Trabajo',
      description: 'Grupo para coordinar actividades y gastos del equipo',
      role: 'MIEMBRO',
      members: [
        {id: 31, name: 'Roberto Díaz', email: 'roberto.diaz@moneipe.com', role: 'ADMIN'},
        {id: 32, name: 'Lucía Fernández', email: 'lucia.fernandez@moneipe.com', role: 'MIEMBRO'},
        {id: 33, name: 'Andrés Gutiérrez', email: 'andres.gutierrez@moneipe.com', role: 'MIEMBRO'}
      ]
    },
    {
      id: 4,
      title: 'Amigos del Colegio',
      description: 'Grupo de amigos para organizar reuniones y actividades',
      role: 'MIEMBRO',
      members: [
        {id: 41, name: 'Paula Vargas', email: 'paula.vargas@moneipe.com', role: 'ADMIN'},
        {id: 42, name: 'Mateo Ríos', email: 'mateo.rios@moneipe.com', role: 'MIEMBRO'},
        {id: 43, name: 'Daniela Peña', email: 'daniela.pena@moneipe.com', role: 'MIEMBRO'},
        {id: 44, name: 'Sebastián León', email: 'sebastian.leon@moneipe.com', role: 'MIEMBRO'}
      ]
    },
    {
      id: 5,
      title: 'Club de Lectura',
      description: 'Grupo para compartir libros y organizar reuniones de lectura',
      role: 'MIEMBRO',
      members: [
        {id: 51, name: 'Elena Soto', email: 'elena.soto@moneipe.com', role: 'ADMIN'},
        {id: 52, name: 'Hugo Navarro', email: 'hugo.navarro@moneipe.com', role: 'MIEMBRO'}
      ]
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
