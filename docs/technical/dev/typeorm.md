# Typeorm

https://typeorm.io/

## Adding extra type of index GIN/BRIN

Edit in the file you generate

```ts
await queryRunner.query(`CREATE EXTENSION pg_trgm;`); // only need to do this one time for the first time adding gin index
await queryRunner.query(`CREATE EXTENSION btree_gin;`); // only need to do this one time for the first time adding gin index
await queryRunner.query(
  `CREATE INDEX "IDX_00ec932a829d7ca03d9d71bf85" ON "amb_game" USING  GIN("name")`
); // GIN INDEX here
```

## Many to many with extra column

```ts
// Table 1
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany((type) => BusinessLine, (businessLine) => businessLine.users)
  @JoinTable({
    name: "user_business_line",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "businessLineId",
      referencedColumnName: "id",
    },
  })
  businessLines: BusinessLine[];
}

// Join table
@Entity("user_business_line")
export class UserBusinessLine {
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @Column()
  @IsNotEmpty()
  @PrimaryColumn()
  userId: number;

  @Column()
  @IsNotEmpty()
  @PrimaryColumn()
  businessLineId: number;
}

// Table 2
@Entity()
export class BusinessLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany((type) => User, (user) => user.businessLines)
  users: User[];
}
```

## Create util to clear cache

```ts
class RedisUtil {
  public async clearCache(key: string) {
    const keys = await this.redis.keys(key); // use this.redis.keys('*') to clear all cache and path/* to clear all cache in path
    await PostgresDataSource.queryResultCache.remove(keys);
  }
}
```
