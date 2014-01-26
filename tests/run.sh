
export NODE_ENV=test

vagrant sandbox on
echo
for file in $@; do
    printf " ${file#test/} "
    node $file && echo -e "\033[32m✓\033[0m"
    code=$?

    if test $code -ne 0; then
        echo -e "\033[31m✖\033[0m"

        vagrant sandbox rollback
        exit $code
    fi
    vagrant sandbox rollback
done
echo
