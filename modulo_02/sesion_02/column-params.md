| Opción | Ejemplo | Qué hace |
|------|--------|--------|
| type | `@Column({ type: 'varchar' })` | Tipo de dato en la BD |
| length | `@Column({ length: 100 })` | Tamaño del campo |
| nullable | `@Column({ nullable: true })` | Permite NULL |
| default | `@Column({ default: true })` | Valor por defecto |
| unique | `@Column({ unique: true })` | Valor único |
| name | `@Column({ name: 'user_name' })` | Nombre real en BD |
| select | `@Column({ select: false })` | No se devuelve en queries |
| update | `@Column({ update: false })` | No se actualiza |
| insert | `@Column({ insert: false })` | No se inserta |
| precision / scale | `@Column('decimal', { precision: 10, scale: 2 })` | Decimales |
| enum | `@Column({ type: 'enum', enum: ['A', 'B'] })` | Enum |