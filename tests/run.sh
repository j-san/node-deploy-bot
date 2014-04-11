
export NODE_ENV=test

vagrant sandbox on
echo
for file in $@; do
    vagrant sandbox rollback && sleep 5
    printf " ${file#test/} "
    node $file && echo -e "\033[32m✓\033[0m"
    code=$?

    if test $code -ne 0; then
        echo -e "\033[31m✖\033[0m"
        exit $code
    fi
done
echo
