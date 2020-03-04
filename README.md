# tailor-s3-fetch-template

simple implementation of tailor fetch-template for S3

## Dependencies

[Docker](https://www.docker.com/)
[LocalStack](https://github.com/localstack/localstack)

## Testing

Start localstack

```bash
TMPDIR=/private$TMPDIR localstack start --docker
cd tests
mocha *
```
