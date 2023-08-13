import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn, JoinTable } from "typeorm"
import { UserEntity } from "./User.entity"
export enum UserRole {
    ADMIN = "admin",
    SUPER = "super",
    NORMAL = "normal",
}
@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.NORMAL,
    })
    role!: UserRole
     // Define the many-to-many relationship with the users table
  @ManyToMany(() => UserEntity, user => user.roles)
    users!: UserEntity[]
    
}