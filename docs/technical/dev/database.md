## Database Isolation

Database isolation is different between database engines.

| Isolation Level                              | Dirty Read      | Lost Update | Non-Repeatable Read | Phantom Read    |
| -------------------------------------------- | --------------- | ----------- | ------------------- | --------------- |
| Read Uncommitted                             | Yes (Not in PG) | Yes         | Yes                 | Yes             |
| Read Committed                               | No              | Yes         | Yes                 | Yes             |
| Non-Repeatable Read                          | No              | No          | No                  | Yes (Not in PG) |
| Serializable                                 | No              | No          | No                  | No              |
| Read Committed with Snapshot (Only in MSSQL) | No              | No          | No                  | No              |

## Dirty Read

A dirty read occurs when a transaction is allowed to read data from a row that has been modified by another running
transaction and not yet committed.

### Lost Update

A lost update occurs when two transactions are trying to update the same row at the same time. The first transaction
reads the row, then the second transaction reads the row, then the first transaction updates the row, then the second
transaction updates the row. The result is that the first transaction's update is lost.

### Non-Repeatable Read

A non-repeatable read occurs when a transaction is allowed to read the same row twice and get a different value each

### Phantom Read

A phantom read occurs when a transaction is allowed to read a set of rows that satisfy a search condition and the second
transaction inserts a new row that satisfies that search condition.
